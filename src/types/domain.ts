/** カメラの物理仕様（撮影範囲の計算に使用） */
export interface CameraSpec {
  sensorWidth: number;  // mm
  sensorHeight: number; // mm
  focalLength: number;  // mm
}

/** 飛行パラメータ（UIの入力値） */
export interface FlightParams {
  height: number; // 高度 m
  speed: number;  // 速度 m/s
  front: number;  // 進行方向オーバーラップ率 0-1
  side: number;   // 横方向オーバーラップ率 0-1
  angle?: number; // 飛行方向（度）。畝の向きに合わせる
}

/** ウェイポイント1点（内部形式） */
export interface Waypoint {
  index: number;
  lon: number;
  lat: number;
  height: number;
  speed: number;
}

/** 圃場ポリゴン: [経度, 緯度] の配列（閉じない） */
export type PolygonCoords = [number, number][];

/** 保存される圃場 */
export interface Field {
  id: string;            // 一意なID（UUID）
  name: string;          // 圃場名（例: 「No.46 キャベツ北」）
  polygon: PolygonCoords; // 圃場の境界
  createdAt: string;     // 作成日時（ISO 8601形式）
}