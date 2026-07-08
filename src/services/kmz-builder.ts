import JSZip from 'jszip';
import type { Waypoint } from '@/types/domain';

/**
 * ひな型KMZのウェイポイントを差し替えて新しいKMZを生成する。
 * @param template ひな型KMZのバイト列（テストではファイル、本番ではfetch結果）
 * @param waypoints 書き込むウェイポイント列
 */
export async function buildKmz(
  template: ArrayBuffer | Uint8Array,
  waypoints: Waypoint[],
  options: { gimbalPitch?: number; takePhoto?: boolean } = {},
): Promise<Uint8Array> {
  if (waypoints.length === 0) {
    throw new Error('ウェイポイントが空です。先にルートを生成してください');
  }

  const zip = await JSZip.loadAsync(template);

  // ① waylines.wpml をテキストとして取り出す
  const wpmlFile = zip.file('wpmz/waylines.wpml');
  if (!wpmlFile) {
    throw new Error('ひな型KMZに wpmz/waylines.wpml がありません');
  }
  const wpmlText = await wpmlFile.async('string');

  // ② XMLとして解析
  const doc = new DOMParser().parseFromString(wpmlText, 'application/xml');

  // ③ ひな型の最初の Placemark を「見本」として1つ取っておく
  const folder = doc.querySelector('Folder');
  const sample = folder?.querySelector('Placemark');
  if (!folder || !sample) {
    throw new Error('ひな型のWPMLに Placemark がありません');
  }

  // ④ ひな型の既存 Placemark を全部消す
  folder.querySelectorAll('Placemark').forEach((p) => p.remove());

  // ⑤ ウェイポイントの数だけ見本を複製し、値を書き換える
  for (const w of waypoints) {
    const pm = sample.cloneNode(true) as Element;
    setText(pm, 'coordinates', `${w.lon},${w.lat}`);
    setWpml(pm, 'index', String(w.index));
    setWpml(pm, 'executeHeight', String(w.height));
    setWpml(pm, 'waypointSpeed', String(w.speed));
    if (options.gimbalPitch !== undefined) {
      // カメラを向ける・回す・姿勢記録の3種類すべてを指定角度に統一する
      setWpmlAll(pm, 'gimbalPitchRotateAngle', String(options.gimbalPitch));
      setWpmlAll(pm, 'waypointGimbalPitchAngle', String(options.gimbalPitch));
    }
    if (options.takePhoto) {
      // 録画開始（ひな型の設定）を静止画撮影に置き換える
      const funcs = pm.getElementsByTagName('wpml:actionActuatorFunc');
      for (const el of Array.from(funcs)) {
        if (el.textContent === 'startRecord') el.textContent = 'takePhoto';
      }
      // アクションの適用範囲を「この地点だけ」に直す
      // （ひな型は0番用の設定のままなので、複製先の番号に合わせる）
      setWpmlAll(pm, 'actionGroupStartIndex', String(w.index));
      setWpmlAll(pm, 'actionGroupEndIndex', String(w.index));
    }
    folder.appendChild(pm);
  }

  // ⑥ XMLを文字列に戻してZIPに書き戻す
  const out = new XMLSerializer().serializeToString(doc);
  zip.file('wpmz/waylines.wpml', out);

  // ⑦ 再圧縮（Uint8Arrayはnodeでもブラウザでも扱える形式）
  return await zip.generateAsync({ type: 'uint8array' });
}

// 補助：タグの中身を書き換える
function setText(parent: Element, tag: string, value: string) {
  const el = parent.getElementsByTagName(tag)[0];
  if (el) el.textContent = value;
}
function setWpml(parent: Element, name: string, value: string) {
  const el = parent.getElementsByTagName('wpml:' + name)[0];
  if (el) el.textContent = value;
}
// 補助：該当するタグ「すべて」の中身を書き換える（setWpmlは最初の1つだけ）
function setWpmlAll(parent: Element, name: string, value: string) {
  const els = parent.getElementsByTagName('wpml:' + name);
  for (const el of Array.from(els)) {
    el.textContent = value;
  }
}
