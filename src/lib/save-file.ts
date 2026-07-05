/** バイト列をファイルとしてダウンロードさせる（ブラウザ専用） */
export function saveFile(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}