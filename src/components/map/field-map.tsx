'use client';

import { useEffect } from 'react';
import {
  MapContainer, TileLayer, Polyline, Polygon, CircleMarker, Tooltip, useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { DrawControl } from './draw-control';
import type { PolygonCoords, Waypoint } from '@/types/domain';

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
      map.fitBounds(polygon.map(([lng, lat]) => [lat, lng] as [number, number]));
    }
  }, [map, polygon]);
  return null;
}

export function FieldMap({ polygon, waypoints, onPolygonDrawn }: Props) {
  const latlngs = waypoints?.map(w => [w.lat, w.lon] as [number, number]) ?? [];
  const polygonLatlngs =
    polygon?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];

  return (
    <MapContainer
      center={[41.84, 140.76]}
      zoom={16}
      style={{ height: '70vh', width: '100%' }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Esri"
        maxZoom={19}
      />
      <DrawControl onPolygonDrawn={onPolygonDrawn} />
      <FitBounds polygon={polygon} />
      {polygonLatlngs.length > 0 && (
        <Polygon positions={polygonLatlngs} pathOptions={{ color: 'green' }} />
      )}
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