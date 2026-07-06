'use client';

import { useEffect } from 'react';

/** Service Workerをブラウザに登録する（本番のみ。開発中はキャッシュが邪魔になるため） */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // 登録に失敗してもサイト自体は普通に動くので何もしない
      });
    }
  }, []);
  return null; // 画面には何も描かない
}