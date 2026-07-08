'use client';

import { useState } from 'react';
import type { Field } from '@/types/domain';

interface Props {
  fields: Field[];
  error: string | null;
  onSave: (name: string) => void | Promise<void>;
  onLoad: (field: Field) => void;
  onRemove: (id: string) => void;
}

/** 保存済み圃場の一覧・保存・読み込み・削除 */
export function FieldList({ fields, error, onSave, onLoad, onRemove }: Props) {
  const [fieldName, setFieldName] = useState('');

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        保存した圃場
      </h2>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="圃場名（例: No.46 キャベツ北）"
          className="min-w-0 flex-1 rounded-xl border-2 border-zinc-200 px-3 py-2.5 text-base"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
        />
        <button
          onClick={async () => {
            await onSave(fieldName);
            setFieldName('');
          }}
          className="shrink-0 rounded-xl border-2 border-green-800 px-5 py-2.5 text-base font-bold text-green-800 active:bg-green-50"
        >
          保存
        </button>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
          {error}
        </p>
      )}

      {fields.length === 0 ? (
        <p className="text-sm text-zinc-500">保存済みの圃場はまだありません</p>
      ) : (
        <ul className="space-y-3">
          {fields.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-4 rounded-xl border-2 border-zinc-200 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold">{f.name}</p>
                <p className="text-sm text-zinc-500">
                  {new Date(f.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <button
                onClick={() => onLoad(f)}
                className="shrink-0 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-bold text-white active:bg-green-900"
              >
                読み込む
              </button>
              <button
                onClick={() => {
                  if (confirm(`「${f.name}」を削除しますか？`)) {
                    onRemove(f.id);
                  }
                }}
                className="shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold text-red-700 active:bg-red-50"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
