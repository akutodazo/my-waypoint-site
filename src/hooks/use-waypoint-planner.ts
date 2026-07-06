'use client';

import { useCallback, useState } from 'react';
import { generateRoute } from '@/services/route-generator';
import { buildKmz } from '@/services/kmz-builder';
import { saveFile } from '@/lib/save-file';
import type { FlightPreset } from '@/types/domain';
import type { FlightParams, PolygonCoords, Waypoint } from '@/types/domain';

export function useWaypointPlanner() {
  const [params, setParams] = useState<FlightParams>({
    height: 50, speed: 5, front: 0.8, side: 0.7,
  });
  const [polygon, setPolygonState] = useState<PolygonCoords | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setPolygon = useCallback((p: PolygonCoords) => {
    setPolygonState(p);
    setWaypoints(null); // 圃場を描き直したら古いルートは無効にする
  }, []);

  const updateParam = (key: keyof FlightParams, value: number) =>
    setParams(prev => ({ ...prev, [key]: value }));

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
    setWaypoints(generateRoute(polygon, params));
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
      const bytes = await buildKmz(template, waypoints);
      saveFile(bytes, 'route.kmz');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'KMZ生成に失敗しました');
    }
  };

  return { params, updateParam, applyPreset, waypoints, error, setPolygon, generate, download };}