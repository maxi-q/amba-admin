import { isFioComplete, parseFioFromApi } from "./fio.ts";

export function validateOrdProfileName(name: string, juridicalType: "physical" | "ip" | "juridical"): string | undefined {
  if (juridicalType === "juridical") {
    return name.trim() ? undefined : "Укажите наименование организации";
  }
  return isFioComplete(parseFioFromApi(name)) ? undefined : "Укажите фамилию, имя и отчество";
}
