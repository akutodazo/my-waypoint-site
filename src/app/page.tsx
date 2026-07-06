'use client';

import dynamic from 'next/dynamic';
import { useWaypointPlanner } from '@/hooks/use-waypoint-planner';
import { FLIGHT_PRESETS } from '@/services/presets';

// LeafletはブラウザでしかI動かないため、サーバー描画を無効化して読み込む
const FieldMap = dynamic(
  () => import('@/components/map/field-map').then(m => m.FieldMap),
  { ssr: false, loading: () => <p className="p-4">地図を読み込み中…</p> },
);

export default function Home() {
  const planner = useWaypointPlanner();

  return (
    <main>
      <FieldMap
        waypoints={planner.waypoints}
        onPolygonDrawn={planner.setPolygon}
      />
      <div className="flex flex-wrap gap-2 px-4 pt-4">
        {FLIGHT_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => planner.applyPreset(preset)}
            title={preset.description}
            className="rounded border border-green-700 px-3 py-2 text-sm text-green-800 hover:bg-green-50"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm">
          高度(m)
          <input
            type="number"
            className="mt-1 block w-24 rounded border px-2 py-1"
            value={planner.params.height}
            onChange={e => planner.updateParam('height', Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          速度(m/s)
          <input
            type="number"
            className="mt-1 block w-24 rounded border px-2 py-1"
            value={planner.params.speed}
            onChange={e => planner.updateParam('speed', Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          進行方向の重なり(%)
          <input
            type="number"
            className="mt-1 block w-24 rounded border px-2 py-1"
            value={planner.params.front * 100}
            onChange={e => planner.updateParam('front', Number(e.target.value) / 100)}
          />
        </label>
        <label className="text-sm">
          横方向の重なり(%)
          <input
            type="number"
            className="mt-1 block w-24 rounded border px-2 py-1"
            value={planner.params.side * 100}
            onChange={e => planner.updateParam('side', Number(e.target.value) / 100)}
          />
        </label>
        <button
          onClick={planner.generate}
          className="rounded bg-green-700 px-4 py-2 text-white"
        >
          ルート生成
        </button>
        <button
          onClick={planner.download}
          className="rounded bg-blue-700 px-4 py-2 text-white"
        >
          KMZダウンロード
        </button>
      </div>

      {planner.error && <p className="px-4 text-red-600">{planner.error}</p>}
    </main>
  );
}