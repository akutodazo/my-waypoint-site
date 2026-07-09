'use client';

import { useCallback, useState } from 'react';
import { saveFile } from '@/lib/save-file';
import { buildKmz } from '@/services/kmz-builder';
import {
  estimateFlightSeconds,
  formatArea,
  formatDuration,
  polygonAreaSqm,
} from '@/services/flight-metrics';
import { generateRoute } from '@/services/route-generator';
import type {
  FlightParams,
  FlightPreset,
  PolygonCoords,
  Waypoint,
} from '@/types/domain';

// DJI Fly（Air 3S / Lito X1）のウェイポイント飛行の上限
const WAYPOINT_LIMIT = 200;

/** 経路の生成とKMZダウンロードを担当するPresenter（「飛ばす」係） */
export function useWaypointPlanner() {
  const [params, setParams] = useState<FlightParams>({
    height: 50,
    speed: 5,
    front: 0.8,
    side: 0.7,
    gimbalPitch: -90,
  });
  const [polygon, setPolygonState] = useState<PolygonCoords | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const setPolygon = useCallback((p: PolygonCoords) => {
    setPolygonState(p);
    setWaypoints(null); // 圃場を描き直したら古いルートは無効にする
  }, []);

  const updateParam = (key: keyof FlightParams, value: number) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const applyPreset = (preset: FlightPreset) =>
    setParams({
      height: preset.height,
      speed: preset.speed,
      front: preset.front,
      side: preset.side,
      gimbalPitch: preset.gimbalPitch,
    });

  const generate = () => {
    if (!polygon) {
      setError('先に圃場を描いてください');
      return;
    }
    setError(null);
    const wps = generateRoute(polygon, params);
    setWaypoints(wps);
    setWarning(
      wps.length > WAYPOINT_LIMIT
        ? `ウェイポイントが${wps.length}点あり、DJI Flyの上限${WAYPOINT_LIMIT}点を超えています。` +
            '高度を上げるか、圃場を分けて作成してください'
        : null,
    );
  };

  const clearRoute = () => {
    setWaypoints(null);
    setWarning(null);
  };

  const clearPolygon = () => {
    setPolygonState(null);
    setWaypoints(null);
    setWarning(null);
    setError(null);
  };

  const download = async () => {
    if (!waypoints || waypoints.length === 0) {
      setError('先にルートを生成してください');
      return;
    }
    try {
      setError(null);
      const res = await fetch('template.kmz');
      if (!res.ok) throw new Error('ひな型KMZの取得に失敗しました');
      const template = await res.arrayBuffer();
      const bytes = await buildKmz(template, waypoints, {
        gimbalPitch: params.gimbalPitch,
        takePhoto: true,
      });
      saveFile(bytes, 'route.kmz');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'KMZ生成に失敗しました');
    }
  };

  // 派生値（描画・生成の状態から毎回計算）
  const areaText = polygon ? formatArea(polygonAreaSqm(polygon)) : null;
  const flightText =
    waypoints && waypoints.length > 0
      ? formatDuration(estimateFlightSeconds(waypoints, params.speed))
      : null;

  return {
    params,
    updateParam,
    applyPreset,
    polygon,
    setPolygon,
    clearPolygon,
    waypoints,
    generate,
    clearRoute,
    error,
    warning,
    download,
    areaText,
    flightText,
  };
}
