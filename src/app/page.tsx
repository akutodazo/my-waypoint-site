'use client';

import dynamic from 'next/dynamic';
import { useWaypointPlanner } from '@/hooks/use-waypoint-planner';
import { FLIGHT_PRESETS } from '@/services/presets';
import { useState } from 'react';

// LeafletはブラウザでしかI動かないため、サーバー描画を無効化して読み込む
const FieldMap = dynamic(
  () => import('@/components/map/field-map').then(m => m.FieldMap),
  { ssr: false, loading: () => <p className="p-4">地図を読み込み中…</p> },
);

export default function Home() {
  const planner = useWaypointPlanner();
    const [fieldName, setFieldName] = useState('');

  return (
    <main>
      <FieldMap
        polygon={planner.polygon}
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
            <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-1">
        {FLIGHT_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => planner.applyPreset(preset)}
            title={preset.description}
            className="shrink-0 rounded border border-green-700 px-4 py-3 text-base text-green-800 active:bg-green-100"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:flex sm:flex-wrap sm:items-end">
        <label className="text-sm">
          高度(m)
          <input
            type="number"
            className="mt-1 block w-full rounded border px-3 py-2 text-base sm:w-24"
            value={planner.params.height}
            onChange={e => planner.updateParam('height', Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          速度(m/s)
          <input
            type="number"
            className="mt-1 block w-full rounded border px-3 py-2 text-base sm:w-24"
            value={planner.params.speed}
            onChange={e => planner.updateParam('speed', Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          進行方向の重なり(%)
          <input
            type="number"
            className="mt-1 block w-full rounded border px-3 py-2 text-base sm:w-24"
            value={planner.params.front * 100}
            onChange={e => planner.updateParam('front', Number(e.target.value) / 100)}
          />
        </label>
        <label className="text-sm">
          横方向の重なり(%)
          <input
            type="number"
            className="mt-1 block w-full rounded border px-3 py-2 text-base sm:w-24"
            value={planner.params.side * 100}
            onChange={e => planner.updateParam('side', Number(e.target.value) / 100)}
          />
        </label>
                <label className="text-sm">
          ジンバル角(度)
          <input
            type="number"
            max={0}
            min={-90}
            className="mt-1 block w-full rounded border px-3 py-2 text-base sm:w-24"
            value={planner.params.gimbalPitch ?? -90}
            onChange={e => planner.updateParam('gimbalPitch', Number(e.target.value))}
          />
        </label>
        <button
          onClick={planner.generate}
          className="col-span-2 rounded bg-green-700 px-4 py-3 text-base text-white sm:col-span-1 sm:w-auto"
        >
          ルート生成
        </button>
        <button
          onClick={planner.download}
          className="col-span-2 rounded bg-blue-700 px-4 py-3 text-base text-white sm:col-span-1 sm:w-auto"
        >
          KMZダウンロード
        </button>
      </div>

      {planner.error && <p className="px-4 text-red-600">{planner.error}</p>}
            <div className="border-t p-4">
        <h2 className="mb-2 text-sm font-bold">保存した圃場</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="圃場名（例: No.46 キャベツ北）"
            className="rounded border px-2 py-1 text-sm"
            value={fieldName}
            onChange={e => setFieldName(e.target.value)}
          />
          <button
            onClick={async () => {
              await planner.saveField(fieldName);
              setFieldName('');
            }}
            className="rounded bg-green-700 px-3 py-1 text-sm text-white"
          >
            今の圃場を保存
          </button>
        </div>
        {planner.fields.length === 0 ? (
          <p className="text-sm text-gray-500">
            保存済みの圃場はまだありません
          </p>
        ) : (
          <ul className="space-y-1">
            {planner.fields.map(f => (
              <li key={f.id} className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => planner.loadField(f)}
                  className="rounded border border-blue-700 px-2 py-1 text-blue-700 hover:bg-blue-50"
                >
                  読み込む
                </button>
                <span>{f.name}</span>
                <span className="text-gray-400">
                  {new Date(f.createdAt).toLocaleDateString('ja-JP')}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`「${f.name}」を削除しますか？`)) {
                      planner.removeField(f.id);
                    }
                  }}
                  className="ml-auto rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}