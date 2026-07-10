'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ActionPanel } from '@/components/planner/action-panel';
import { FieldList } from '@/components/planner/field-list';
import { ParamForm } from '@/components/planner/param-form';
import { PresetBar } from '@/components/planner/preset-bar';
import { useWaypointPlanner } from '@/hooks/use-waypoint-planner';
import { useFields } from '@/hooks/use-fields';

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
  const fieldStore = useFields(planner.polygon);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">
                圃場ルート
              </h1>
              <p className="text-xs text-zinc-500">
                圃場を描いて自動飛行ルートを作成
              </p>
            </div>
          </div>
          <Link
            href="/guide"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700 active:bg-zinc-100"
          >
            転送手順
          </Link>
        </div>
      </header>

      <FieldMap
        polygon={planner.polygon}
        waypoints={planner.waypoints}
        onPolygonDrawn={planner.setPolygon}
        onClearRoute={planner.clearRoute}
        onClearPolygon={planner.clearPolygon}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-5 py-6">
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">撮影設定</h2>
          <PresetBar onApply={planner.applyPreset} />
          <ParamForm params={planner.params} onChange={planner.updateParam} />
        </section>

        <ActionPanel
          waypointCount={planner.waypoints?.length ?? null}
          areaText={planner.areaText}
          flightText={planner.flightText}
          notice={planner.notice}
          error={planner.error}
          warning={planner.warning}
          onGenerate={planner.generate}
          onDownload={planner.download}
        />

        <FieldList
          fields={fieldStore.fields}
          error={fieldStore.error}
          onSave={fieldStore.saveField}
          onLoad={(f) => planner.setPolygon(f.polygon)}
          onRemove={fieldStore.removeField}
        />
      </div>
    </main>
  );
}

/** ブランドマーク（圃場＝区画＋飛行経路のグリフ） */
function BrandMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-800 text-white">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h10" />
      </svg>
    </span>
  );
}
