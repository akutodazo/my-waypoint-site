import type { Field } from '@/types/domain';
import type { IFieldRepository } from '../interfaces/i-field-repository';

const STORAGE_KEY = 'my-waypoint-site:fields';

/** IFieldRepositoryのlocalStorage実装。Phase 4でDB実装に差し替え予定 */
export class LocalStorageFieldRepository implements IFieldRepository {
  async findAll(): Promise<Field[]> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Field[];
    } catch {
      // データが壊れていたら空扱い（クラッシュさせない）
      return [];
    }
  }

  async findById(id: string): Promise<Field | null> {
    const all = await this.findAll();
    return all.find(f => f.id === id) ?? null;
  }

  async save(field: Field): Promise<void> {
    const all = await this.findAll();
    const rest = all.filter(f => f.id !== field.id); // 同IDを除いてから
    this.write([...rest, field]);                    // 追加＝上書き（upsert）
  }

  async delete(id: string): Promise<void> {
    const all = await this.findAll();
    this.write(all.filter(f => f.id !== id));
  }

  private write(fields: Field[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  }
}