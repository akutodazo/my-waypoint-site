'use client';

import { useState } from 'react';
import { searchPlaces } from '@/services/geocoding';
import type { PlaceResult, PlaceSearch } from '@/types/domain';

/** 場所検索を担当するPresenter */
export function usePlaceSearch(): PlaceSearch {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const found = await searchPlaces(trimmed);
      setResults(found);
      if (found.length === 0) setError('該当する場所が見つかりませんでした');
    } catch {
      setError('検索に失敗しました。通信状況を確認してください');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setResults([]);
    setError(null);
  };

  return { query, setQuery, results, loading, error, run, clear };
}
