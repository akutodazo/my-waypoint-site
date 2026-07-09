import type { PlaceResult } from '@/types/domain';

const GSI_ENDPOINT = 'https://msearch.gsi.go.jp/address-search/AddressSearch';

/**
 * 国土地理院 住所検索APIのレスポンス（GeoJSON Feature配列）を PlaceResult[] に変換する純粋関数。
 * coordinates は [経度, 緯度] の順。不正・壊れた要素は除外し、非配列入力は空配列を返す。
 */
export function parseGsiResults(json: unknown): PlaceResult[] {
  if (!Array.isArray(json)) return [];

  const results: PlaceResult[] = [];
  for (const item of json) {
    if (typeof item !== 'object' || item === null) continue;
    const feature = item as {
      geometry?: { coordinates?: unknown };
      properties?: { title?: unknown };
    };
    const coords = feature.geometry?.coordinates;
    const title = feature.properties?.title;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') continue;
    if (typeof title !== 'string' || title.length === 0) continue;
    results.push({ name: title, lat, lng });
  }
  return results;
}

/**
 * 地名・住所で場所を検索する（地理院API）。APIキー不要。
 * I/Oラッパのため単体テストせず、変換ロジックは parseGsiResults 側でテストする。
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const res = await fetch(`${GSI_ENDPOINT}?q=${encodeURIComponent(trimmed)}`);
  if (!res.ok) throw new Error('検索に失敗しました');
  return parseGsiResults(await res.json());
}
