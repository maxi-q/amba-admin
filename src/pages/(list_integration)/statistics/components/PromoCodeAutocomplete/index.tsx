import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Badge, Button, InputField, PageLoader } from '@senler/ui';
import { useCustomPromoCodes } from '@/hooks/promoCodes/useCustomPromoCodes';
import type { AutocompleteOption, PromoCodeAutocompleteProps } from '../../types';

export const PromoCodeAutocomplete = ({ selectedIds, onChange, roomId }: PromoCodeAutocompleteProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 200);
  const { promoCodes, isLoading } = useCustomPromoCodes(roomId);

  const allOptions = useMemo<AutocompleteOption[]>(
    () => promoCodes.map((promoCode) => ({ id: promoCode.id, label: `${promoCode.name} — ${promoCode.promoCode}` })),
    [promoCodes]
  );

  const labelById = useMemo(() => {
    const labels = new Map<string, string>();
    for (const option of allOptions) labels.set(option.id, option.label);
    return labels;
  }, [allOptions]);

  const displayOptions = useMemo(() => {
    const selectedOptions = selectedIds.map((id) => ({ id, label: labelById.get(id) ?? id }));
    const query = debouncedSearch.toLowerCase().trim();
    const filtered = query
      ? allOptions.filter((option) => option.label.toLowerCase().includes(query)).slice(0, 10)
      : allOptions.slice(0, 20);
    const merged: AutocompleteOption[] = [];
    const seen = new Set<string>();

    for (const option of [...selectedOptions, ...filtered]) {
      if (seen.has(option.id)) continue;
      seen.add(option.id);
      merged.push(option);
    }

    return merged;
  }, [allOptions, debouncedSearch, labelById, selectedIds]);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);
  };

  return (
    <div className="grid w-full gap-2">
      <p className="text-sm font-medium text-foreground">Произвольный промокод</p>
      <InputField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Начните вводить название или код…"
        aria-label="Поиск произвольного промокода"
      />
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => (
            <Badge
              key={id}
              variant="secondary"
              className="flex max-w-full items-center gap-1 py-0.5 pl-2 pr-0.5 font-normal"
            >
              <span className="max-w-[280px] truncate">{labelById.get(id) ?? id}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={`Убрать: ${labelById.get(id) ?? id}`}
                onClick={() => toggle(id)}
              >
                <X className="size-3.5" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="max-h-48 overflow-y-auto rounded-md border border-border p-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <PageLoader label="Загрузка…" />
          </div>
        ) : displayOptions.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">Нет произвольных промокодов</p>
        ) : (
          <ul className="space-y-0.5">
            {displayOptions.map((option) => (
              <li key={option.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 text-sm hover:bg-muted/60">
                  <input
                    type="checkbox"
                    className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    checked={selectedIds.includes(option.id)}
                    onChange={() => toggle(option.id)}
                  />
                  <span className="min-w-0 leading-snug">{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
