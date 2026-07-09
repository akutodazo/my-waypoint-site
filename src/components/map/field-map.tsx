'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  CircleMarker,
  Tooltip,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { DrawControl } from './draw-control';
import { SearchBox } from './search-box';
import type { PlaceResult, PolygonCoords, Waypoint } from '@/types/domain';

interface Props {
  polygon: PolygonCoords | null;
  waypoints: Waypoint[] | null;
  onPolygonDrawn: (polygon: PolygonCoords) => void;
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
 * ┌─────────────────────────────┐
 * │ 左上: 検索ボックス(SearchBox)  右上: 操作ボタン(削除等) │
 * │                                              │
 * │ 左下: (予約・未使用)          右下: ズーム(ZoomControl) │
 * └─────────────────────────────┘
 * - 各ゾーンは絶対配置 + z-[1000]。1ゾーンに1コンポーネントまで。
 * - Leaflet既定のズームは左上に出るため zoomControl={false} で無効化し右下へ再配置。
 * - 新しいオーバーレイを足すときは空きゾーンを使い、既存ゾーンと重ねない。
 */
export function FieldMap({ polygon, waypoints, onPolygonDrawn }: Props) {
  const [flyTarget, setFlyTarget] = useState<PlaceResult | null>(null);
  const latlngs =
    waypoints?.map((w) => [w.lat, w.lon] as [number, number]) ?? [];
  const polygonLatlngs =
    polygon?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];

  return (
    <div className="relative">
      {/* 左上ゾーン */}
      <SearchBox onSelect={setFlyTarget} />
      <MapContainer
        center={[41.84, 140.76]}
        zoom={16}
        zoomControl={false}
        className="h-[60vh] w-full sm:h-[70vh]"
      >
        {/* 右下ゾーン: ズーム */}
        <ZoomControl position="bottomright" />
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
            pathOptions={{ color: '#166534', weight: 2, fillOpacity: 0.08 }}
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
