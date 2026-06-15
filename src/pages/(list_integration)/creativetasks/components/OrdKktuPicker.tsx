import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Badge, Button, InputField, PageLoader } from "@senler/ui";
import { useOrdKktuSearch } from "@/hooks/ord/useOrdKktuSearch";
import { ORD_CREATIVE_KKTU_MAX } from "../ordCreative.utils";

interface OrdKktuPickerProps {
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
  error?: string;
}

export function OrdKktuPicker({
  selectedCodes,
  onChange,
  disabled = false,
  error,
}: OrdKktuPickerProps) {
  const [search, setSearch] = useState("");
  const { searchResults, labelByCode, isSearching } = useOrdKktuSearch({
    search,
    selectedCodes,
    enabled: !disabled,
  });

  const displayOptions = useMemo(() => {
    const selectedOptions = selectedCodes.map((code) => ({
      code,
      name: labelByCode.get(code) ?? code,
    }));
    const merged = [...selectedOptions];
    const seen = new Set(selectedCodes);

    for (const item of searchResults) {
      if (seen.has(item.code)) continue;
      seen.add(item.code);
      merged.push(item);
    }

    return merged;
  }, [labelByCode, searchResults, selectedCodes]);

  const toggle = (code: string) => {
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter((item) => item !== code));
      return;
    }
    if (selectedCodes.length >= ORD_CREATIVE_KKTU_MAX) return;
    onChange([...selectedCodes, code]);
  };

  const remove = (code: string) => {
    onChange(selectedCodes.filter((item) => item !== code));
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">Коды ККТУ</p>
        <p className="text-xs text-muted-foreground">
          1 код для обычного креатива, до {ORD_CREATIVE_KKTU_MAX} для кобрендинга.
        </p>
      </div>

      <InputField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Поиск по коду или описанию…"
        aria-label="Поиск ККТУ"
        disabled={disabled}
      />

      {selectedCodes.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedCodes.map((code) => (
            <Badge
              key={code}
              variant="secondary"
              className="flex max-w-full items-center gap-1 py-0.5 pl-2 pr-0.5 font-normal"
            >
              <span className="max-w-[280px] truncate">
                {code}
                {labelByCode.get(code) ? ` — ${labelByCode.get(code)}` : ""}
              </span>
              {!disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={`Убрать код ${code}`}
                  onClick={() => remove(code)}
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="max-h-52 overflow-y-auto rounded-md border border-border p-2">
        {search.trim().length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            Введите запрос для поиска в справочнике ККТУ
          </p>
        ) : isSearching ? (
          <div className="flex justify-center py-6">
            <PageLoader label="Поиск…" />
          </div>
        ) : displayOptions.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">Ничего не найдено</p>
        ) : (
          <ul className="space-y-0.5">
            {displayOptions.map((item) => (
              <li key={item.code}>
                <label
                  className={`flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 text-sm hover:bg-muted/60 ${
                    disabled ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    checked={selectedCodes.includes(item.code)}
                    disabled={
                      disabled ||
                      (!selectedCodes.includes(item.code) && selectedCodes.length >= ORD_CREATIVE_KKTU_MAX)
                    }
                    onChange={() => toggle(item.code)}
                  />
                  <span className="min-w-0 leading-snug">
                    <span className="font-medium">{item.code}</span>
                    {item.name ? ` — ${item.name}` : ""}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
