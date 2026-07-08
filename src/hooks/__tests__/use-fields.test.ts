/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { useFields } from '../use-fields';
import type { PolygonCoords } from '@/types/domain';

const polygon: PolygonCoords = [
  [140.76, 41.84],
  [140.761, 41.84],
  [140.761, 41.841],
];

describe('useFields', () => {
  beforeEach(() => {
    localStorage.clear(); // 各テストを独立させる
  });

  test('初期状態では空の一覧を返す', async () => {
    const { result } = renderHook(() => useFields(polygon));
    await waitFor(() => expect(result.current.fields).toEqual([]));
    expect(result.current.error).toBeNull();
  });

  test('保存すると一覧に追加され、エラーは出ない', async () => {
    const { result } = renderHook(() => useFields(polygon));
    await act(async () => {
      await result.current.saveField('No.46 キャベツ北');
    });
    expect(result.current.fields).toHaveLength(1);
    expect(result.current.fields[0].name).toBe('No.46 キャベツ北');
    expect(result.current.error).toBeNull();
  });

  test('圃場が未選択（null）だと保存できずエラーになる', async () => {
    const { result } = renderHook(() => useFields(null));
    await act(async () => {
      await result.current.saveField('名前だけある');
    });
    expect(result.current.error).toBe('先に圃場を描いてください');
    expect(result.current.fields).toHaveLength(0);
  });

  test('名前が空白だけだと保存できずエラーになる', async () => {
    const { result } = renderHook(() => useFields(polygon));
    await act(async () => {
      await result.current.saveField('   ');
    });
    expect(result.current.error).toBe('圃場名を入力してください');
    expect(result.current.fields).toHaveLength(0);
  });

  test('削除すると一覧から消える', async () => {
    const { result } = renderHook(() => useFields(polygon));
    await act(async () => {
      await result.current.saveField('消す圃場');
    });
    const id = result.current.fields[0].id;
    await act(async () => {
      await result.current.removeField(id);
    });
    expect(result.current.fields).toHaveLength(0);
  });

  test('保存した圃場は画面を開き直しても読み込まれる（永続化）', async () => {
    const first = renderHook(() => useFields(polygon));
    await act(async () => {
      await first.result.current.saveField('残る圃場');
    });
    first.unmount(); // 画面を閉じる操作に相当

    const second = renderHook(() => useFields(polygon)); // 開き直し
    await waitFor(() => expect(second.result.current.fields).toHaveLength(1));
    expect(second.result.current.fields[0].name).toBe('残る圃場');
  });
});
