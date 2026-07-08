import type { Field } from '@/types/domain';

/**
 * 圃場の保存・取得の「契約」。
 * 保存先が何か（localStorage、DB…）はこのファイルでは決めない。
 */
export interface IFieldRepository {
  /** 全圃場を取得する（0件なら空配列） */
  findAll(): Promise<Field[]>;
  /** IDで1件取得する（無ければnull） */
  findById(id: string): Promise<Field | null>;
  /** 保存する（同じIDが既にあれば上書き） */
  save(field: Field): Promise<void>;
  /** 削除する（無いIDなら何もしない） */
  delete(id: string): Promise<void>;
}
