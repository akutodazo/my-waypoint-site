import type { CameraSpec, FlightParams } from '@/types/domain';

/**
 * 機体・法規・地理のドメイン定数。飛行計画に関わる数値はここに集約し、
 * 他はここからimportする（機体変更・法改正時の修正点を1箇所に閉じるため）。
 */

/** DJI Fly（Air 3S / Lito X1）のウェイポイント飛行の上限点数 */
export const WAYPOINT_LIMIT = 200;

/** 航空法の150m未満制限を踏まえた飛行高度の上限(m) */
export const MAX_FLIGHT_HEIGHT_M = 149;

/** 緯度1度あたりの距離(m)。度⇔メートル換算の近似に使う */
export const METERS_PER_DEG_LAT = 111320;

/**
 * 35mm判換算24mm・4:3センサーの機体（DJI Air 3S広角 / Lito X1）。
 * 換算値で統一: 幅34.6×高さ26.0（対角43.3=フルサイズ対角）・焦点24mm相当
 */
export const DEFAULT_CAMERA: CameraSpec = {
  sensorWidth: 34.6,
  sensorHeight: 26.0,
  focalLength: 24,
};

/** UI初期表示の飛行パラメータ（プリセット「圃場全体 20m」とは独立した安全側の既定値） */
export const DEFAULT_FLIGHT_PARAMS: FlightParams = {
  height: 50,
  speed: 5,
  front: 0.8,
  side: 0.7,
  gimbalPitch: -90,
};
