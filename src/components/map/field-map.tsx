'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { DrawControl } from './draw-control';
import { SearchBox } from './search-box';
import type {
  PlaceResult,
  PlaceSearch,
  PolygonCoords,
  Waypoint,
} from '@/types/domain';

interface Props {
  polygon: PolygonCoords | null;
  waypoints: Waypoint[] | null;
  placeSearch: PlaceSearch;
  onPolygonDrawn: (polygon: PolygonCoords) => void;
  onClearRoute: () => void;
  onClearPolygon: () => void;
}

/** 地図右上の削除ボタン群（範囲＝面積+ルートを一括削除 / ルートのみ削除） */
function DeleteControls({
  hasPolygon,
  hasRoute,
  onClearPolygon,
  onClearRoute,
}: {
  hasPolygon: boolean;
  hasRoute: boolean;
  onClearPolygon: () => void;
  onClearRoute: () => void;
}) {
  if (!hasPolygon && !hasRoute) return null;
  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-2">
      {hasPolygon && (
        <button
          onClick={onClearPolygon}
          aria-label="範囲とルートを削除"
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-bold text-red-700 shadow-md active:bg-red-50"
        >
          <TrashIcon />
          範囲を削除
        </button>
      )}
      {hasRoute && (
        <button
          onClick={onClearRoute}
          aria-label="ルートのみ削除"
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-bold text-zinc-700 shadow-md active:bg-zinc-100"
        >
          <TrashIcon />
          ルートのみ
        </button>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

/** polygonが変わったら地図をその場所に移動させる */
function FitBounds({ polygon }: { polygon: PolygonCoords | null }) {
  const map = useMap();
  useEffect(() => {
    if (polygon && polygon.length >= 3) {
      map.fitBounds(
        polygon.map(([lng, lat]) => [lat, lng] as [number, number]),
      );
    }
  }, [map, polygon]);
  return null;
}

/** 検索で選ばれた地点へ地図を移動させる */
function FlyTo({ target }: { target: PlaceResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], 17);
  }, [map, target]);
  return null;
}

/**
 * 地図オーバーレイの配置ゾーン（重複防止のため必ずここに従う）
 * ┌──────────────────────────────────┐
 * │ 左上コーナー: Leaflet標準（ズーム＋描画ツールバー、縦積み） │
 * │ その右(left-14): 検索ボックス     右上: 削除ボタン(DeleteControls) │
 * │                                                  │
 * │ 左下・右下: (予約・未使用)                        │
 * └──────────────────────────────────┘
 * - Leaflet標準コントロール（zoom / leaflet-draw描画）は左上コーナーに縦積みで残す。
 *   leaflet-drawの編集/削除ツールバーは無効（削除は右上の自作ボタンで行う）。
 * - 検索ボックスは left-14 でその右にずらし、標準コントロールと重ねない。
 * - React製オーバーレイは絶対配置 + z-[1000]。1ゾーンに1コンポーネントまで。
 * - 新しいオーバーレイは空きゾーン（左下→右下の順）を使う。
 */
export function FieldMap({
  polygon,
  waypoints,
  placeSearch,
  onPolygonDrawn,
  onClearRoute,
  onClearPolygon,
}: Props) {
  const [flyTarget, setFlyTarget] = useState<PlaceResult | null>(null);
  const latlngs =
    waypoints?.map((w) => [w.lat, w.lon] as [number, number]) ?? [];
  const polygonLatlngs =
    polygon?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];

  return (
    <div className="relative">
      {/* 左上コーナーの右: 検索ボックス */}
      <SearchBox search={placeSearch} onSelect={setFlyTarget} />
      {/* 右上: 削除ボタン */}
      <DeleteControls
        hasPolygon={polygon !== null}
        hasRoute={latlngs.length > 0}
        onClearPolygon={onClearPolygon}
        onClearRoute={onClearRoute}
      />
      <MapContainer
        center={[41.84, 140.76]}
        zoom={16}
        className="h-[60vh] w-full sm:h-[70vh]"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Esri"
          maxZoom={19}
        />
        <DrawControl onPolygonDrawn={onPolygonDrawn} />
        <FitBounds polygon={polygon} />
        <FlyTo target={flyTarget} />
        {polygonLatlngs.length > 0 && (
          <Polygon
            positions={polygonLatlngs}
            // 圃場（緑・茶）に埋もれないマゼンタ系。ルート(琥珀)とも明確に区別
            pathOptions={{
              color: '#db2777',
              weight: 3,
              fillColor: '#db2777',
              fillOpacity: 0.1,
            }}
          />
        )}
        {latlngs.length > 0 && (
          <Polyline
            positions={latlngs}
            pathOptions={{ color: '#f59e0b', weight: 3 }}
          />
        )}
        {waypoints?.map((w) => (
          <CircleMarker
            key={w.index}
            center={[w.lat, w.lon]}
            radius={5}
            pathOptions={{
              color: '#b45309',
              fillColor: '#fbbf24',
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Tooltip>{String(w.index)}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
