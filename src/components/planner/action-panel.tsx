'use client';

interface Props {
  waypointCount: number | null; // ルート未生成ならnull
  areaText: string | null; // 推定面積（polygon有時）
  flightText: string | null; // 推定飛行時間（route有時）
  error: string | null;
  warning: string | null;
  onGenerate: () => void;
  onDownload: () => void;
}

/** 実行ボタン・生成結果・メッセージ表示（削除は地図右上のボタンで行う） */
export function ActionPanel({
  waypointCount,
  areaText,
  flightText,
  error,
  warning,
  onGenerate,
  onDownload,
}: Props) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onGenerate}
          className="h-14 flex-1 rounded-xl bg-green-800 text-lg font-bold text-white shadow-sm active:bg-green-900"
        >
          ルート生成
        </button>
        <button
          onClick={onDownload}
          className="h-14 flex-1 rounded-xl bg-zinc-900 text-lg font-bold text-white shadow-sm active:bg-black"
        >
          KMZダウンロード
        </button>
      </div>

      {(areaText || waypointCount !== null) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {areaText && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-600">推定面積</p>
              <p className="text-xl font-bold text-zinc-900">{areaText}</p>
            </div>
          )}
          {waypointCount !== null && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-600">
                点数 ／ 推定飛行時間
              </p>
              <p className="text-xl font-bold text-zinc-900">
                {waypointCount} 点
                {flightText && <span className="text-zinc-300"> ／ </span>}
                {flightText}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                ※飛行時間は目安（加減速・旋回で前後します）
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-base font-bold text-red-800">
          {error}
        </p>
      )}
      {warning && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-base font-bold text-amber-900">
          ⚠ {warning}
        </p>
      )}
    </section>
  );
}
