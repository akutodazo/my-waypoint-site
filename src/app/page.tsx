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
        onClearRoute={planner.clearRoute}
        onClearPolygon={planner.clearPolygon}
      />

      <div className="mx-auto max-w-3xl space-y-10 px-5 py-8">
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            撮影設定
          </h2>
          <PresetBar onApply={planner.applyPreset} />
          <ParamForm params={planner.params} onChange={planner.updateParam} />
        </section>

        <ActionPanel
          waypointCount={planner.waypoints?.length ?? null}
          areaText={planner.areaText}
          flightText={planner.flightText}
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
