'use client';

import type { FlightParams } from '@/types/domain';

interface Props {
  params: FlightParams;
  onChange: (key: keyof FlightParams, value: number) => void;
}

const INPUT =
  'mt-1.5 block w-full rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-lg font-bold';
const LABEL = 'text-sm font-medium text-zinc-600';

/** 飛行パラメータの入力フォーム */
export function ParamForm({ params, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <label>
        <span className={LABEL}>高度(m)</span>
        <input
          type="number"
          className={INPUT}
          value={params.height}
          onChange={(e) => onChange('height', Number(e.target.value))}
        />
      </label>
      <label>
        <span className={LABEL}>速度(m/s)</span>
        <input
          type="number"
          className={INPUT}
          value={params.speed}
          onChange={(e) => onChange('speed', Number(e.target.value))}
        />
      </label>
      <label>
        <span className={LABEL}>前方重なり(%)</span>
        <input
          type="number"
          className={INPUT}
          value={params.front * 100}
          onChange={(e) => onChange('front', Number(e.target.value) / 100)}
        />
      </label>
      <label>
        <span className={LABEL}>横重なり(%)</span>
        <input
          type="number"
          className={INPUT}
          value={params.side * 100}
          onChange={(e) => onChange('side', Number(e.target.value) / 100)}
        />
      </label>
      <label>
        <span className={LABEL}>ジンバル角(度)</span>
        <input
          type="number"
          max={0}
          min={-90}
          className={INPUT}
          value={params.gimbalPitch ?? -90}
          onChange={(e) => onChange('gimbalPitch', Number(e.target.value))}
        />
      </label>
    </div>
  );
}
