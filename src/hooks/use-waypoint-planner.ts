'use client';
import { useCallback, useEffect, useState } from 'react';
import { generateRoute } from '@/services/route-generator';
import { buildKmz } from '@/services/kmz-builder';
import { saveFile } from '@/lib/save-file';
import { LocalStorageFieldRepository } from '@/repositories/implementations/local-storage-field-repository';
import type { IFieldRepository } from '@/repositories/interfaces/i-field-repository';
import type { Field, FlightParams, FlightPreset, PolygonCoords, Waypoint } from '@/types/domain';

// 保存先の実体はここだけが知っている。Phase 4でDB版に差し替えるときもこの1行だけ変わる
const fieldRepository: IFieldRepository = new LocalStorageFieldRepository();

export function useWaypointPlanner() {
  const [params, setParams] = useState<FlightParams>({
    height: 50, speed: 5, front: 0.8, side: 0.7, gimbalPitch: -90,
  });
  const [polygon, setPolygonState] = useState<PolygonCoords | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setPolygon = useCallback((p: PolygonCoords) => {
    setPolygonState(p);
    setWaypoints(null); // 圃場を描き直したら古いルートは無効にする
  }, []);

    const [fields, setFields] = useState<Field[]>([]);

  // 画面を開いたとき保存済み圃場を読み込む
  useEffect(() => {
    fieldRepository.findAll().then(setFields);
  }, []);

  const saveField = async (name: string) => {
    if (!polygon) {
      setError('先に圃場を描いてください');
      return;
    }
    if (!name.trim()) {
      setError('圃場名を入力してください');
      return;
    }
    setError(null);
    await fieldRepository.save({
      id: crypto.randomUUID(),
      name: name.trim(),
      polygon,
      createdAt: new Date().toISOString(),
    });
    setFields(await fieldRepository.findAll());
  };

  const loadField = (field: Field) => {
    setError(null);
    setPolygonState(field.polygon);
    setWaypoints(null); // 別の圃場を読んだら古いルートは無効
  };

  const removeField = async (id: string) => {
    await fieldRepository.delete(id);
    setFields(await fieldRepository.findAll());
  };

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
      const bytes = await buildKmz(template, waypoints, {
        gimbalPitch: params.gimbalPitch,
      });
      saveFile(bytes, 'route.kmz');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'KMZ生成に失敗しました');
    }
  };

  

  return {
    params, updateParam, applyPreset, polygon, waypoints, error,
    setPolygon, generate, download,
    fields, saveField, loadField, removeField,
  };
}