import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';

// GitHub Pagesではサイトが /my-waypoint-site/ 配下にあるため、本番だけ接頭辞をつける
const basePath = process.env.NODE_ENV === 'production' ? '/my-waypoint-site' : '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ウェイポイントルート作成',
    short_name: '圃場ルート',
    description: '圃場を描いてDJI Fly用のグリッド飛行KMZを生成',
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: 'standalone', // アドレスバーを隠してアプリらしく起動する
    background_color: '#ffffff',
    theme_color: '#15803d',
    icons: [
      { src: `${basePath}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${basePath}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  };
}