export interface AllPagesOptions {
  allPages?: boolean;
}

/** Collect a fixed set of pages; never expose a partial result as a complete list. */
export async function collectPages<Response extends {
  items: unknown[];
  page: number;
  totalPages: number;
}>(getPage: (page: number) => Promise<Response>): Promise<Response> {
  const first = await getPage(1);
  if (first.page !== 1 || !Number.isSafeInteger(first.totalPages) || first.totalPages < 0) {
    throw new Error("Не удалось загрузить весь список: некорректная пагинация.");
  }
  const items = [...first.items];
  // ponytail: load all pages for local search/selectors until the API supports search and detail filters.
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await getPage(page);
    if (next.page !== page || next.items.length === 0) {
      throw new Error("Не удалось загрузить весь список. Обновите данные и попробуйте снова.");
    }
    items.push(...next.items);
  }
  return { ...first, items };
}
