import type { FlightPreset } from '@/types/domain';

/**
 * 事前検証（2026年・道南農業試験場）で確認した撮影パラメータ。
 * 出典: 「飛行高度・角度・経路の最適化による作物生育の推定」
 */
export const FLIGHT_PRESETS: FlightPreset[] = [
  {
    id: 'overview-20',
    label: '圃場全体 20m',
    description: '圃場全体のオルソ画像作成用。まずはこれ',
    height: 20,
    gimbalPitch: -90,
    front: 0.8,
    side: 0.7,
    speed: 5,
  },
  {
    id: 'detail-10',
    label: '詳細 10m',
    description: '葉を目視できる詳細なオルソ画像用',
    height: 10,
    gimbalPitch: -90,
    front: 0.8,
    side: 0.7,
    speed: 5,
  },
  {
    id: 'oblique-10',
    label: '斜め撮影 10m',
    description: '3D化（SfM）の精度を上げる斜め撮影用',
    height: 10,
    gimbalPitch: -60,
    front: 0.8,
    side: 0.7,
    speed: 5,
  },
  {
    id: 'overview-color',
    label: '全体撮影（色確認）',
    description:
      '小麦等の色ムラ確認用。範囲全体を2〜3枚で撮影（高度は自動計算）',
    height: 100, // 全体撮影モードでは自動計算されるためこの値は使われない
    gimbalPitch: -90,
    front: 0,
    side: 0,
    speed: 5,
  },
];

export function getPresetById(id: string): FlightPreset | undefined {
  return FLIGHT_PRESETS.find((p) => p.id === id);
}
