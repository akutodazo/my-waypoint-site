/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { buildKmz } from '../kmz-builder';
import type { Waypoint } from '@/types/domain';

// テストの正解データ＝DJI Flyが出力した本物のKMZ
const templatePath = path.join(
  process.cwd(), 'legacy', 'samples', 'dji-fly-original.kmz',
);
const template = fs.readFileSync(templatePath);

const waypoints: Waypoint[] = [
  { index: 0, lon: 140.760, lat: 41.840, height: 30, speed: 5 },
  { index: 1, lon: 140.761, lat: 41.840, height: 30, speed: 5 },
  { index: 2, lon: 140.761, lat: 41.841, height: 30, speed: 5 },
];

/** 生成されたKMZからwaylines.wpmlを取り出してXMLとして解析する補助関数 */
async function parseWpml(kmzBytes: Uint8Array) {
  const zip = await JSZip.loadAsync(kmzBytes);
  const wpmlText = await zip.file('wpmz/waylines.wpml')!.async('string');
  const doc = new DOMParser().parseFromString(wpmlText, 'application/xml');
  return { zip, wpmlText, doc };
}

describe('buildKmz', () => {
  test('KMZ（ZIP）として生成され、必要な2ファイルを含む', async () => {
    const out = await buildKmz(template, waypoints);
    const zip = await JSZip.loadAsync(out);
    expect(zip.file('wpmz/waylines.wpml')).not.toBeNull();
    expect(zip.file('wpmz/template.kml')).not.toBeNull();
  });

  test('Placemarkの数がウェイポイント数と一致する（ひな型の5個が3個に置き換わる）', async () => {
    const out = await buildKmz(template, waypoints);
    const { doc } = await parseWpml(out);
    expect(doc.getElementsByTagName('Placemark').length).toBe(3);
  });

  test('座標・高度・速度・indexが入力どおりに書き込まれる', async () => {
    const out = await buildKmz(template, waypoints);
    const { doc } = await parseWpml(out);
    const first = doc.getElementsByTagName('Placemark')[0];

    expect(first.getElementsByTagName('coordinates')[0].textContent)
      .toBe('140.76,41.84');
    expect(first.getElementsByTagName('wpml:index')[0].textContent)
      .toBe('0');
    expect(first.getElementsByTagName('wpml:executeHeight')[0].textContent)
      .toBe('30');
    expect(first.getElementsByTagName('wpml:waypointSpeed')[0].textContent)
      .toBe('5');
  });

  test('ひな型の機体設定（missionConfig）が保持される', async () => {
    const out = await buildKmz(template, waypoints);
    const { wpmlText } = await parseWpml(out);
    // DJI Flyが機体を認識するための設定。消えると飛行できない
    expect(wpmlText).toContain('<wpml:droneEnumValue>68</wpml:droneEnumValue>');
    expect(wpmlText).toContain('<wpml:finishAction>goHome</wpml:finishAction>');
  });

  test('ウェイポイント0件ならエラーを投げる', async () => {
    await expect(buildKmz(template, [])).rejects.toThrow();
  });
});