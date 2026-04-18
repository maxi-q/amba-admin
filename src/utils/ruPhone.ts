/** Начальное значение поля с маской +7 (до ввода цифр). */
export const INITIAL_RU_PHONE_DISPLAY = "+7 ";

/** 10 цифр после кода страны (без ведущей 7). */
export function extractRuMobileNationalDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (d.startsWith("7")) d = d.slice(1);
  return d.slice(0, 10);
}

/** Маска +7 (XXX) XXX-XX-XX по уже извлечённым национальным цифрам (0–10 шт.). */
export function buildRuPhoneDisplay(nationalDigits: string): string {
  const b = nationalDigits.replace(/\D/g, "").slice(0, 10);
  if (b.length === 0) return INITIAL_RU_PHONE_DISPLAY;

  let s = "+7 (";
  s += b.slice(0, Math.min(3, b.length));
  if (b.length <= 3) {
    return b.length === 3 ? s + ") " : s;
  }
  s += ") " + b.slice(3, Math.min(6, b.length));
  if (b.length <= 6) return s;
  s += "-" + b.slice(6, Math.min(8, b.length));
  if (b.length <= 8) return s;
  return s + "-" + b.slice(8, 10);
}

/**
 * Маска +7 (XXX) XXX-XX-XX — удобный ввод с фиксированным +7.
 * Храните в state строку результата; для API используйте ruPhoneToE164.
 */
export function formatRuMobileInput(raw: string): string {
  return buildRuPhoneDisplay(extractRuMobileNationalDigits(raw));
}

/**
 * Обновление значения при вводе с учётом Backspace по символам маски:
 * если строка стала короче, а набор цифр не изменился, снимаем последнюю цифру.
 */
export function applyRuPhoneChange(prevDisplay: string, nextValue: string): string {
  let digits = extractRuMobileNationalDigits(nextValue);
  const prevDigits = extractRuMobileNationalDigits(prevDisplay);
  if (digits === prevDigits && nextValue.length < prevDisplay.length) {
    digits = prevDigits.slice(0, -1);
  }
  return buildRuPhoneDisplay(digits);
}

/** true, если введены все 10 цифр после +7. */
export function isCompleteRuMobile(formatted: string): boolean {
  return extractRuMobileNationalDigits(formatted).length === 10;
}

/** Строка для API: +79991234567 */
export function ruPhoneToE164(formatted: string): string {
  const b = extractRuMobileNationalDigits(formatted);
  if (b.length !== 10) return "";
  return `+7${b}`;
}
