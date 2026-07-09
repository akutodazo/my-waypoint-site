'use client';

import { usePlaceSearch } from '@/hooks/use-place-search';
import type { PlaceResult } from '@/types/domain';

interface Props {
  onSelect: (place: PlaceResult) => void;
}

/** 地図左上に重ねる場所検索ボックス（地理院API） */
export function SearchBox({ onSelect }: Props) {
  const search = usePlaceSearch();

  return (
    <div className="absolute left-3 top-3 z-[1000] w-64 max-w-[calc(100%-1.5rem)]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search.run();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          inputMode="search"
          placeholder="地名・住所で検索"
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base shadow-sm"
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-green-800 px-3 py-2 text-sm font-bold text-white shadow-sm active:bg-green-900"
        >
          検索
        </button>
      </form>

      {search.loading && (
        <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-zinc-500 shadow-sm">
          検索中…
        </p>
      )}
      {search.error && (
        <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm">
          {search.error}
        </p>
      )}
      {search.results.length > 0 && (
        <ul className="mt-2 max-h-60 overflow-y-auto rounded-xl bg-white shadow-lg">
          {search.results.map((place, i) => (
            <li key={`${place.name}-${i}`}>
              <button
                onClick={() => {
                  onSelect(place);
                  search.clear();
                  search.setQuery(place.name);
                }}
                className="block w-full border-b border-zinc-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-green-50"
              >
                {place.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
