// ひな型KMZ（同じフォルダに置いた template.kmz）を読み込む
async function loadTemplate() {
  const res = await fetch('template.kmz');     // ファイルを取得
  const buf = await res.arrayBuffer();         // バイナリとして読む
  return await JSZip.loadAsync(buf);           // ZIPとして展開
}

async function buildKmz(waypoints) {
  const zip = await loadTemplate();

  // ① waylines.wpml をテキストとして取り出す
  const wpmlText = await zip.file('wpmz/waylines.wpml').async('string');

  // ② XMLとして解析
  const parser = new DOMParser();
  const doc = parser.parseFromString(wpmlText, 'application/xml');

  // ③ ひな型の最初の Placemark を「見本」として1つ取っておく
  const folder = doc.querySelector('Folder');
  const sample = folder.querySelector('Placemark');

  // ④ ひな型の既存 Placemark を全部消す
  folder.querySelectorAll('Placemark').forEach(p => p.remove());

  // ⑤ 計算したウェイポイントの数だけ、見本を複製して値を書き換える
  waypoints.forEach(w => {
    const pm = sample.cloneNode(true);         // 見本を丸ごと複製（属性も維持）
    setText(pm, 'coordinates', `${w.lon},${w.lat}`); // 経度,緯度
    setWpml(pm, 'index', w.index);
    setWpml(pm, 'executeHeight', w.height);
    setWpml(pm, 'waypointSpeed', w.speed);
    folder.appendChild(pm);
  });

  // ⑥ XMLを文字列に戻してZIPに書き戻す
  const out = new XMLSerializer().serializeToString(doc);
  zip.file('wpmz/waylines.wpml', out);

  // （template.kml 側も同様に座標を更新するとより確実。まずはwpmlだけでも可）

  // ⑦ ZIPを再圧縮してBlob（ファイル実体）にする
  return await zip.generateAsync({ type: 'blob' });
}

// 補助：タグの中身を書き換える
function setText(parent, tag, value) {
  const el = parent.getElementsByTagName(tag)[0];
  if (el) el.textContent = value;
}
function setWpml(parent, name, value) {
  const el = parent.getElementsByTagName('wpml:' + name)[0];
  if (el) el.textContent = value;
}
// 補助：Blobをダウンロードさせる
function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}