import type { NextConfig } from 'next';
import { BASE_PATH } from './src/config';

const nextConfig: NextConfig = {
  // GitHub Pages用: サーバー不要の静的ファイルとして書き出す
  output: 'export',
  // 公開URLは https://<ユーザー名>.github.io/<リポジトリ名>/ になる
  basePath: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
