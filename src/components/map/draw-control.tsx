'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import type { PolygonCoords } from '@/types/domain';

interface Props {
  onPolygonDrawn: (polygon: PolygonCoords) => void;
}

/** Leaflet.drawのツールバーを地図に取り付けるコンポーネント */
export function DrawControl({ onPolygonDrawn }: Props) {
  const map = useMap(); // 親のMapContainerから地図本体を受け取る

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const control = new L.Control.Draw({
      draw: {
        polygon: {},
        // showArea:trueはleaflet-draw 1.0.4の既知バグでエラーになるため必ずfalse
        rectangle: { showArea: false },
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(control);

    const onCreated = (e: L.LeafletEvent) => {
      drawnItems.clearLayers();
      const layer = (e as L.DrawEvents.Created).layer as L.Polygon;
      drawnItems.addLayer(layer);
      const coords = (layer.getLatLngs()[0] as L.LatLng[])
        .map(ll => [ll.lng, ll.lat] as [number, number]);
      onPolygonDrawn(coords);
    };
    map.on(L.Draw.Event.CREATED, onCreated);

    // 後片付け（画面を離れるときにツールバーとレイヤーを外す）
    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.removeControl(control);
      map.removeLayer(drawnItems);
    };
  }, [map, onPolygonDrawn]);

  return null; // 画面には何も描かない（地図への「取り付け」だけが仕事）
}