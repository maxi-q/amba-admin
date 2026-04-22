import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Badge, Button, InputField, PageLoader } from "@senler/ui";
import type { EventAutocompleteProps, AutocompleteOption } from "../../types";
import { useEvents } from "@/hooks/events/useEvents";
import type { IEvent } from "@services/events/events.types";

export const EventAutocomplete = ({ selectedIds, onChange, roomId }: EventAutocompleteProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 200);

  const { events, isLoading } = useEvents({ page: 1, size: 100 }, roomId);

  const allOptions = useMemo<AutocompleteOption[]>(
    () => events.map((e: IEvent) => ({ id: e.id, label: e.name })),
    [events]
  );

  const labelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of allOptions) m.set(o.id, o.label);
    return m;
  }, [allOptions]);

  const displayOptions = useMemo(() => {
    const selectedOpts: AutocompleteOption[] = selectedIds
      .map((id) => ({ id, label: labelById.get(id) ?? id }))
      .filter((o) => o.id);
    const q = debouncedSearch.toLowerCase().trim();
    let list = allOptions;
    if (q.length >= 1) {
      list = allOptions.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 10);
    } else {
      list = allOptions.slice(0, 20);
    }
    const merged: AutocompleteOption[] = [];
    const seen = new Set<string>();
    for (const o of [...selectedOpts, ...list]) {
      if (seen.has(o.id)) continue;
      seen.add(o.id);
      merged.push(o);
    }
    return merged;
  }, [allOptions, debouncedSearch, selectedIds, labelById]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const remove = (id: string) => {
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div className="grid w-full gap-2">
      <p className="text-sm font-medium text-foreground">Событие</p>
      <InputField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Начните вводить название…"
        aria-label="Поиск события"
      />
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => (
            <Badge
              key={id}
              variant="secondary"
              className="flex max-w-full items-center gap-1 py-0.5 pl-2 pr-0.5 font-normal"
            >
              <span className="max-w-[220px] truncate">{labelById.get(id) ?? id}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={`Убрать: ${labelById.get(id) ?? id}`}
                onClick={() => remove(id)}
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
          <p className="py-2 text-center text-sm text-muted-foreground">Нет событий</p>
        ) : (
          <ul className="space-y-0.5">
            {displayOptions.map((opt) => (
              <li key={opt.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 text-sm hover:bg-muted/60">
                  <input
                    type="checkbox"
                    className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    checked={selectedIds.includes(opt.id)}
                    onChange={() => toggle(opt.id)}
                  />
                  <span className="min-w-0 leading-snug">{opt.label}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
