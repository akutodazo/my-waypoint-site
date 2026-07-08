'use client';

import { FLIGHT_PRESETS } from '@/services/presets';
import type { FlightPreset } from '@/types/domain';

interface Props {
  onApply: (preset: FlightPreset) => void;
}

/** 検証済み撮影プリセットの選択帯 */
export function PresetBar({ onApply }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {FLIGHT_PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onApply(preset)}
          title={preset.description}
          className="shrink-0 rounded-xl border-2 border-zinc-200 px-5 py-3 text-base font-bold active:border-green-800 active:bg-green-50"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
