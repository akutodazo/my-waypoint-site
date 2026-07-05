'use client';

import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { DrawControl } from './draw-control';
import type { PolygonCoords, Waypoint } from '@/types/domain';

interface Props {
  waypoints: Waypoint[] | null;
  onPolygonDrawn: (polygon: PolygonCoords) => void;
}

export function FieldMap({ waypoints, onPolygonDrawn }: Props) {
  // 内部形式は[経度,緯度]、Leafletは[緯度,経度]。ここが変換の境界
  const latlngs = waypoints?.map(w => [w.lat, w.lon] as [number, number]) ?? [];

  return (
    <MapContainer
      center={[41.84, 140.76]} // 函館付近
      zoom={16}
      style={{ height: '70vh', width: '100%' }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Esri"
        maxZoom={19}
      />
      <DrawControl onPolygonDrawn={onPolygonDrawn} />
      {latlngs.length > 0 && (
        <Polyline positions={latlngs} pathOptions={{ color: 'blue' }} />
      )}
      {waypoints?.map(w => (
        <CircleMarker key={w.index} center={[w.lat, w.lon]} radius={4}>
          <Tooltip>{String(w.index)}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}