'use client';

interface Props {
  waypointCount: number | null; // ルート未生成ならnull
  hasPolygon: boolean;
  error: string | null;
  warning: string | null;
  onGenerate: () => void;
  onDownload: () => void;
  onClearRoute: () => void;
  onClearPolygon: () => void;
}

/** 実行ボタン・生成結果・クリア操作・メッセージ表示 */
export function ActionPanel({
  waypointCount,
  hasPolygon,
  error,
  warning,
  onGenerate,
  onDownload,
  onClearRoute,
  onClearPolygon,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onGenerate}
          className="h-14 flex-1 rounded-xl bg-green-800 text-lg font-bold text-white active:bg-green-900"
        >
          ルート生成
        </button>
        <button
          onClick={onDownload}
          className="h-14 flex-1 rounded-xl bg-zinc-900 text-lg font-bold text-white active:bg-black"
        >
          KMZダウンロード
        </button>
      </div>

      {waypointCount !== null && (
        <div className="flex items-center justify-between rounded-xl bg-zinc-100 px-4 py-3">
          <p className="text-sm font-medium">
            ルート生成済み：
            <span className="text-lg font-bold">{waypointCount}</span> 点
          </p>
          <button
            onClick={onClearRoute}
            className="text-sm font-bold text-zinc-600 underline underline-offset-4"
          >
            ルートを消す
          </button>
        </div>
      )}
      {hasPolygon && (
        <button
          onClick={onClearPolygon}
          className="text-sm font-bold text-zinc-600 underline underline-offset-4"
        >
          圃場の選択を解除して描き直す
        </button>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-base font-bold text-red-800">
          {error}
        </p>
      )}
      {warning && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-base font-bold text-amber-800">
          ⚠ {warning}
        </p>
      )}
    </section>
  );
}
