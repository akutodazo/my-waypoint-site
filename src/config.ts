/**
 * サイト全体の環境依存設定。ここ以外にハードコードしない。
 * リポジトリ名を変更する場合はこのファイルだけを直す。
 */
export const BASE_PATH =
  process.env.NODE_ENV === 'production' ? '/my-waypoint-site' : '';
