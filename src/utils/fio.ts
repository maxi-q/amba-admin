/** Части ФИО в форме (хранение и API: «Фамилия Имя Отчество»). */
export type FioParts = { family: string; given: string; patronymic: string };

export const EMPTY_FIO: FioParts = { family: "", given: "", patronymic: "" };

/** ФИО одной строкой для бекенда: Фамилия Имя Отчество */
export function joinFio(parts: FioParts): string {
  return [parts.family, parts.given, parts.patronymic]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

/** Разбор сохранённого ФИО (первые три токена — Ф И О). */
export function parseFioFromApi(fullName: string): FioParts {
  const p = fullName.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 3) {
    return { family: p[0], given: p[1], patronymic: p[2] };
  }
  if (p.length === 2) {
    return { family: p[0], given: p[1], patronymic: "" };
  }
  if (p.length === 1) {
    return { family: p[0], given: "", patronymic: "" };
  }
  return { family: "", given: "", patronymic: "" };
}

export function isFioComplete(parts: FioParts): boolean {
  return !!(parts.family.trim() && parts.given.trim() && parts.patronymic.trim());
}
