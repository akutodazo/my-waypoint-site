'use client';

import type { FlightPreset } from '@/types/domain';

interface Props {
  /** 表示するプリセット一覧（page側でFLIGHT_PRESETSを配線する） */
  presets: FlightPreset[];
  onApply: (preset: FlightPreset) => void;
}

/** 検証済み撮影プリセットの選択帯 */
export function PresetBar({ presets, onApply }: Props) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onApply(preset)}
          title={preset.description}
          className="shrink-0 rounded-xl border-2 border-zinc-300 px-5 py-3 text-base font-bold text-zinc-800 active:border-green-800 active:bg-green-50"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
