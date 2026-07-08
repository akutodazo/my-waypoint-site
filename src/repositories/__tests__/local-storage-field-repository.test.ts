/**
 * @jest-environment jsdom
 */
import { LocalStorageFieldRepository } from '../implementations/local-storage-field-repository';
import type { Field } from '@/types/domain';

const fieldA: Field = {
  id: 'aaa-111',
  name: 'No.46 キャベツ北',
  polygon: [
    [140.76, 41.84],
    [140.761, 41.84],
    [140.761, 41.841],
  ],
  createdAt: '2026-07-04T09:00:00.000Z',
};
const fieldB: Field = {
  id: 'bbb-222',
  name: 'No.19 バレイショ',
  polygon: [
    [140.77, 41.85],
    [140.771, 41.85],
    [140.771, 41.851],
  ],
  createdAt: '2026-07-04T10:00:00.000Z',
};

describe('LocalStorageFieldRepository', () => {
  let repo: LocalStorageFieldRepository;

  beforeEach(() => {
    localStorage.clear(); // 各テストを独立させる（前のテストの保存物を消す）
    repo = new LocalStorageFieldRepository();
  });

  test('初期状態では空配列を返す', async () => {
    expect(await repo.findAll()).toEqual([]);
  });

  test('saveした圃場がfindAllで取得できる', async () => {
    await repo.save(fieldA);
    await repo.save(fieldB);
    const all = await repo.findAll();
    expect(all).toHaveLength(2);
    expect(all.map((f) => f.name)).toContain('No.46 キャベツ北');
  });

  test('同じIDでsaveすると上書きされ、重複しない', async () => {
    await repo.save(fieldA);
    await repo.save({ ...fieldA, name: '改名後の圃場' });
    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('改名後の圃場');
  });

  test('findByIdで1件取得できる。無いIDはnull', async () => {
    await repo.save(fieldA);
    expect((await repo.findById('aaa-111'))?.name).toBe('No.46 キャベツ北');
    expect(await repo.findById('zzz-999')).toBeNull();
  });

  test('deleteで削除される。無いIDを消してもエラーにならない', async () => {
    await repo.save(fieldA);
    await repo.delete('aaa-111');
    expect(await repo.findAll()).toEqual([]);
    await expect(repo.delete('zzz-999')).resolves.not.toThrow();
  });

  test('保存データが壊れていてもクラッシュせず空配列を返す', async () => {
    localStorage.setItem('my-waypoint-site:fields', 'これはJSONではない');
    expect(await repo.findAll()).toEqual([]);
  });

  test('polygonの座標が保存前後で完全に一致する', async () => {
    await repo.save(fieldA);
    const loaded = await repo.findById('aaa-111');
    expect(loaded?.polygon).toEqual(fieldA.polygon);
  });
});
