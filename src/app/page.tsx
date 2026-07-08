'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { useWaypointPlanner } from '@/hooks/use-waypoint-planner';
import { FLIGHT_PRESETS } from '@/services/presets';

// Leafletはブラウザでしか動かないため、サーバー描画を無効化して読み込む
const FieldMap = dynamic(
  () => import('@/components/map/field-map').then((m) => m.FieldMap),
  {
    ssr: false,
    loading: () => <p className="p-6 text-zinc-500">地図を読み込み中…</p>,
  },
);

export default function Home() {
  const planner = useWaypointPlanner();
  const [fieldName, setFieldName] = useState('');

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <header className="flex items-center justify-between px-5 py-4">
        <h1 className="text-lg font-bold tracking-tight">圃場ルート</h1>
        <Link
          href="/guide"
          className="text-sm font-medium text-green-800 underline underline-offset-4"
        >
          転送手順
        </Link>
      </header>

      <FieldMap
        polygon={planner.polygon}
        waypoints={planner.waypoints}
        onPolygonDrawn={planner.setPolygon}
      />

      <div className="mx-auto max-w-3xl space-y-10 px-5 py-8">
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            撮影設定
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {FLIGHT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => planner.applyPreset(preset)}
                title={preset.description}
                className="shrink-0 rounded-xl border-2 border-zinc-200 px-5 py-3 text-base font-bold active:border-green-800 active:bg-green-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <label>
              <span className="text-sm font-medium text-zinc-600">高度(m)</span>
              <input
                type="number"
                className="mt-1.5 block w-full rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-lg font-bold"
                value={planner.params.height}
                onChange={(e) =>
                  planner.updateParam('height', Number(e.target.value))
                }
              />
            </label>
            <label>
              <span className="text-sm font-medium text-zinc-600">
                速度(m/s)
              </span>
              <input
                type="number"
                className="mt-1.5 block w-full rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-lg font-bold"
                value={planner.params.speed}
                onChange={(e) =>
                  planner.updateParam('speed', Number(e.target.value))
                }
              />
            </label>
            <label>
              <span className="text-sm font-medium text-zinc-600">
                前方重なり(%)
              </span>
              <input
                type="number"
                className="mt-1.5 block w-full rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-lg font-bold"
                value={planner.params.front * 100}
                onChange={(e) =>
                  planner.updateParam('front', Number(e.target.value) / 100)
                }
              />
            </label>
            <label>
              <span className="text-sm font-medium text-zinc-600">
                横重なり(%)
              </span>
              <input
                type="number"
                className="mt-1.5 block w-full rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-lg font-bold"
                value={planner.params.side * 100}
                onChange={(e) =>
                  planner.updateParam('side', Number(e.target.value) / 100)
                }
              />
            </label>
            <label>
              <span className="text-sm font-medium text-zinc-600">
                ジンバル角(度)
              </span>
              <input
                type="number"
                max={0}
                min={-90}
                className="mt-1.5 block w-full rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-lg font-bold"
                value={planner.params.gimbalPitch ?? -90}
                onChange={(e) =>
                  planner.updateParam('gimbalPitch', Number(e.target.value))
                }
              />
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={planner.generate}
              className="h-14 flex-1 rounded-xl bg-green-800 text-lg font-bold text-white active:bg-green-900"
            >
              ルート生成
            </button>
            <button
              onClick={planner.download}
              className="h-14 flex-1 rounded-xl bg-zinc-900 text-lg font-bold text-white active:bg-black"
            >
              KMZダウンロード
            </button>
          </div>

          {planner.waypoints && (
            <div className="flex items-center justify-between rounded-xl bg-zinc-100 px-4 py-3">
              <p className="text-sm font-medium">
                ルート生成済み：
                <span className="text-lg font-bold">
                  {planner.waypoints.length}
                </span>{' '}
                点
              </p>
              <button
                onClick={planner.clearRoute}
                className="text-sm font-bold text-zinc-600 underline underline-offset-4"
              >
                ルートを消す
              </button>
            </div>
          )}
          {planner.polygon && (
            <button
              onClick={planner.clearPolygon}
              className="text-sm font-bold text-zinc-600 underline underline-offset-4"
            >
              圃場の選択を解除して描き直す
            </button>
          )}

          {planner.error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-base font-bold text-red-800">
              {planner.error}
            </p>
          )}
          {planner.warning && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-base font-bold text-amber-800">
              ⚠ {planner.warning}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            保存した圃場
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="圃場名（例: No.46 キャベツ北）"
              className="min-w-0 flex-1 rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-base"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
            <button
              onClick={async () => {
                await planner.saveField(fieldName);
                setFieldName('');
              }}
              className="shrink-0 rounded-xl border-2 border-green-800 px-5 py-2.5 text-base font-bold text-green-800 active:bg-green-50"
            >
              保存
            </button>
          </div>
          {planner.fields.length === 0 ? (
            <p className="text-sm text-zinc-500">
              保存済みの圃場はまだありません
            </p>
          ) : (
            <ul className="space-y-3">
              {planner.fields.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-4 rounded-xl border-2 border-zinc-200 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold">{f.name}</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(f.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <button
                    onClick={() => planner.loadField(f)}
                    className="shrink-0 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-bold text-white active:bg-green-900"
                  >
                    読み込む
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`「${f.name}」を削除しますか？`)) {
                        planner.removeField(f.id);
                      }
                    }}
                    className="shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold text-red-700 active:bg-red-50"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
