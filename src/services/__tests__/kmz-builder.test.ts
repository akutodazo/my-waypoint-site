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

describe('buildKmz - ジンバル角の書き込み', () => {
  test('gimbalPitch: -60 を指定すると全ての回転アクションの角度が-60になる', async () => {
    const out = await buildKmz(template, waypoints, { gimbalPitch: -60 });
    const { doc } = await parseWpml(out);
    const angles = doc.getElementsByTagName('wpml:gimbalPitchRotateAngle');
    expect(angles.length).toBeGreaterThan(0);
    for (const el of Array.from(angles)) {
      expect(el.textContent).toBe('-60');
    }
  });

  test('gimbalPitch: -60 を指定すると各地点のジンバル姿勢も-60になる', async () => {
    const out = await buildKmz(template, waypoints, { gimbalPitch: -60 });
    const { doc } = await parseWpml(out);
    const angles = doc.getElementsByTagName('wpml:waypointGimbalPitchAngle');
    expect(angles.length).toBe(waypoints.length); // 1地点につき1つ
    for (const el of Array.from(angles)) {
      expect(el.textContent).toBe('-60');
    }
  });

  test('gimbalPitch: -90（真下）も正しく書き込まれる', async () => {
    const out = await buildKmz(template, waypoints, { gimbalPitch: -90 });
    const { doc } = await parseWpml(out);
    const first = doc.getElementsByTagName('wpml:gimbalPitchRotateAngle')[0];
    expect(first.textContent).toBe('-90');
  });

  test('gimbalPitchを省略するとひな型の角度（0）のまま変更されない', async () => {
    const out = await buildKmz(template, waypoints);
    const { doc } = await parseWpml(out);
    const first = doc.getElementsByTagName('wpml:gimbalPitchRotateAngle')[0];
    expect(first.textContent).toBe('0');
  });
});

describe('buildKmz - 撮影アクション', () => {
  test('takePhoto: true で全地点に撮影アクションが入る', async () => {
    const out = await buildKmz(template, waypoints, { takePhoto: true });
    const { doc } = await parseWpml(out);
    const placemarks = Array.from(doc.getElementsByTagName('Placemark'));
    for (const pm of placemarks) {
      const funcs = Array.from(pm.getElementsByTagName('wpml:actionActuatorFunc'))
        .map(el => el.textContent);
      expect(funcs).toContain('takePhoto');
    }
  });

  test('takePhoto: true で録画開始アクションが残らない', async () => {
    const out = await buildKmz(template, waypoints, { takePhoto: true });
    const { wpmlText } = await parseWpml(out);
    expect(wpmlText).not.toContain('startRecord');
  });

  test('takePhoto: true で各地点のアクション適用範囲が自分の番号になる', async () => {
    const out = await buildKmz(template, waypoints, { takePhoto: true });
    const { doc } = await parseWpml(out);
    const placemarks = Array.from(doc.getElementsByTagName('Placemark'));
    placemarks.forEach(pm => {
      const index = pm.getElementsByTagName('wpml:index')[0].textContent;
      const starts = Array.from(pm.getElementsByTagName('wpml:actionGroupStartIndex'));
      const ends = Array.from(pm.getElementsByTagName('wpml:actionGroupEndIndex'));
      for (const el of [...starts, ...ends]) {
        expect(el.textContent).toBe(index);
      }
    });
  });

  test('takePhotoを省略するとひな型のまま（録画開始が残る）', async () => {
    const out = await buildKmz(template, waypoints);
    const { wpmlText } = await parseWpml(out);
    expect(wpmlText).toContain('startRecord');
  });
});