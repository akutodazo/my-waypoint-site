import { parseGsiResults } from '../geocoding';

describe('parseGsiResults', () => {
  const sample = [
    {
      geometry: { coordinates: [143.207, 42.63], type: 'Point' },
      type: 'Feature',
      properties: { title: '北海道河西郡更別村' },
    },
    {
      geometry: { coordinates: [140.7291, 41.7687], type: 'Point' },
      type: 'Feature',
      properties: { title: '北海道函館市' },
    },
  ];

  test('GSIのGeoJSON配列を name/lat/lng に変換する', () => {
    const results = parseGsiResults(sample);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      name: '北海道河西郡更別村',
      lat: 42.63,
      lng: 143.207,
    });
  });

  test('coordinatesは[経度,緯度]の順（lng/latを取り違えない）', () => {
    const [first] = parseGsiResults(sample);
    expect(first.lng).toBe(143.207);
    expect(first.lat).toBe(42.63);
  });

  test('空配列は空配列を返す', () => {
    expect(parseGsiResults([])).toEqual([]);
  });

  test('配列でない入力（null/オブジェクト/文字列）は空配列を返す', () => {
    expect(parseGsiResults(null)).toEqual([]);
    expect(parseGsiResults({ error: 'x' })).toEqual([]);
    expect(parseGsiResults('これはJSONではない')).toEqual([]);
  });

  test('壊れた要素（座標欠落・title欠落）は除外し、正常分だけ返す', () => {
    const broken = [
      { geometry: { coordinates: [140, 41] }, properties: {} }, // title欠落
      { properties: { title: '座標なし' } }, // geometry欠落
      sample[0], // 正常
    ];
    const results = parseGsiResults(broken);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('北海道河西郡更別村');
  });
});
