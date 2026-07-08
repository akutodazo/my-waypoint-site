import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Pages用: サーバー不要の静的ファイルとして書き出す
  output: 'export',
  // 公開URLが https://akutodazo.github.io/my-waypoint-site/ になるため
  basePath: process.env.NODE_ENV === 'production' ? '/my-waypoint-site' : '',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
