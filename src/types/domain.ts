/** カメラの物理仕様（撮影範囲の計算に使用） */
export interface CameraSpec {
  sensorWidth: number; // mm
  sensorHeight: number; // mm
  focalLength: number; // mm
}

/** 飛行パラメータ（UIの入力値） */
export interface FlightParams {
  height: number; // 高度 m
  speed: number; // 速度 m/s
  front: number; // 進行方向オーバーラップ率 0-1
  side: number; // 横方向オーバーラップ率 0-1
  angle?: number; // 飛行方向（度）。畝の向きに合わせる
  gimbalPitch?: number; // ジンバル角（度）。-90=真下、未指定は-90扱い
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
  id: string; // 一意なID（UUID）
  name: string; // 圃場名（例: 「No.46 キャベツ北」）
  polygon: PolygonCoords; // 圃場の境界
  createdAt: string; // 作成日時（ISO 8601形式）
}

/** 場所検索の結果1件 */
export interface PlaceResult {
  name: string; // 表示名（例: 「北海道河西郡更別村」）
  lat: number;
  lng: number;
}

/**
 * 場所検索の状態と操作。usePlaceSearch（Presenter）が提供し、
 * SearchBox（UI）はこれをpropsで受け取るだけにする（依存の掟）
 */
export interface PlaceSearch {
  query: string;
  setQuery: (query: string) => void;
  results: PlaceResult[];
  loading: boolean;
  error: string | null;
  run: () => Promise<void>;
  clear: () => void;
}

/** 検証済みの撮影パラメータのセット */
export interface FlightPreset {
  id: string;
  label: string; // ボタンに表示する短い名前
  description: string; // 何のための撮影か
  height: number;
  gimbalPitch: number;
  front: number;
  side: number;
  speed: number;
}
