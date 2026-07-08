'use client';

import { useEffect, useState } from 'react';
import { LocalStorageFieldRepository } from '@/repositories/implementations/local-storage-field-repository';
import type { IFieldRepository } from '@/repositories/interfaces/i-field-repository';
import type { Field, PolygonCoords } from '@/types/domain';

// 保存先の実体はここだけが知っている。Phase 4でDB版に差し替えるときもこの1行だけ変わる
const fieldRepository: IFieldRepository = new LocalStorageFieldRepository();

/** 圃場の保存・一覧・削除を担当するPresenter（「覚える」係） */
export function useFields(polygon: PolygonCoords | null) {
  const [fields, setFields] = useState<Field[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const removeField = async (id: string) => {
    await fieldRepository.delete(id);
    setFields(await fieldRepository.findAll());
  };

  return { fields, error, saveField, removeField };
}
