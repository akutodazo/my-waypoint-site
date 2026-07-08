import type { MetadataRoute } from 'next';
import { BASE_PATH } from '@/config';

// 静的書き出し（output: export）ではビルド時に固定ファイル化することを明示する
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ウェイポイントルート作成',
    short_name: '圃場ルート',
    description: '圃場を描いてDJI Fly用のグリッド飛行KMZを生成',
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#15803d',
    icons: [
      { src: `${BASE_PATH}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${BASE_PATH}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  };
}
