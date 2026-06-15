import { useMemo } from "react";
import { useDebounce } from "use-debounce";
import { useOrdDictionaryControllerGetKktuCodes } from "@/api/generated/ord-dictionary/ord-dictionary";
import { OrdDictionaryControllerGetKktuCodesLang } from "@/api/generated/model";

interface UseOrdKktuSearchParams {
  search: string;
  selectedCodes: string[];
  enabled?: boolean;
}

export function useOrdKktuSearch({
  search,
  selectedCodes,
  enabled = true,
}: UseOrdKktuSearchParams) {
  const [debouncedSearch] = useDebounce(search, 300);

  const searchQuery = useOrdDictionaryControllerGetKktuCodes(
    {
      search: debouncedSearch.trim() || undefined,
      limit: 20,
      lang: OrdDictionaryControllerGetKktuCodesLang.ru,
    },
    {
      query: {
        enabled: enabled && debouncedSearch.trim().length >= 1,
      },
    }
  );

  const selectedCodesParam = selectedCodes.join(",");
  const selectedQuery = useOrdDictionaryControllerGetKktuCodes(
    {
      codes: selectedCodesParam || undefined,
      limit: selectedCodes.length || 1,
      lang: OrdDictionaryControllerGetKktuCodesLang.ru,
    },
    {
      query: {
        enabled: enabled && selectedCodes.length > 0,
      },
    }
  );

  const labelByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of searchQuery.data?.items ?? []) {
      map.set(item.code, item.name);
    }
    for (const item of selectedQuery.data?.items ?? []) {
      map.set(item.code, item.name);
    }
    return map;
  }, [searchQuery.data?.items, selectedQuery.data?.items]);

  const searchResults = searchQuery.data?.items ?? [];

  return {
    searchResults,
    labelByCode,
    isSearching: searchQuery.isFetching,
    isLoadingSelected: selectedQuery.isFetching,
  };
}
