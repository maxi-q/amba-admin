import type { IOrdJuridicalType } from "@services/rooms/rooms.types";

const INN_COEFFICIENTS_10 = [2, 4, 10, 3, 5, 9, 4, 6, 8];
const INN_COEFFICIENTS_12_1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
const INN_COEFFICIENTS_12_2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

/** Как на бекенде: `backend/src/utils/validators/inn.ts` — validateInn */
export function validateInn(inn: string, juridicalType: IOrdJuridicalType): { normalized: string; error: string | null } {
  const normalized = inn.replace(/\D/g, "");

  if (normalized.length !== 10 && normalized.length !== 12) {
    return { normalized: "", error: "ИНН должен содержать 10 или 12 цифр" };
  }

  if (juridicalType === "juridical" && normalized.length !== 10) {
    return { normalized: "", error: "Юридическое лицо должно иметь ИНН из 10 цифр" };
  }

  if ((juridicalType === "physical" || juridicalType === "ip") && normalized.length !== 12) {
    return { normalized: "", error: "Физическое лицо и ИП должны иметь ИНН из 12 цифр" };
  }

  const digits = normalized.split("").map((d) => parseInt(d, 10));

  const calcChecksum = (coeffs: number[]) => {
    const sum = coeffs.reduce((acc, coef, i) => acc + coef * digits[i], 0);
    return (sum % 11) % 10;
  };

  if (normalized.length === 10) {
    if (digits[9] !== calcChecksum(INN_COEFFICIENTS_10)) {
      return { normalized: "", error: "Некорректный ИНН (контрольное число не совпадает)" };
    }
  } else {
    const n11 = calcChecksum(INN_COEFFICIENTS_12_1);
    const n12 = calcChecksum(INN_COEFFICIENTS_12_2);
    if (digits[10] !== n11 || digits[11] !== n12) {
      return { normalized: "", error: "Некорректный ИНН (контрольные цифры не совпадают)" };
    }
  }

  return { normalized, error: null };
}
