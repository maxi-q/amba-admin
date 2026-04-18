import { PRIMARY_COLOR } from "@/constants/colors";
import type { IOrdJuridicalType } from "@services/rooms/rooms.types";

export const ORD_JURIDICAL_OPTIONS: { value: IOrdJuridicalType; label: string }[] = [
  { value: "physical", label: "Физ. лицо" },
  { value: "ip", label: "ИП" },
  { value: "juridical", label: "Юр. лицо" },
];

export const ORD_COPY = {
  pageTitle: "ОРД",
  createSectionTitle: "Создать профиль ОРД",
  profileSectionTitle: "Профиль ОРД",
  roomNotFound: "Комната не найдена",
  phonePlaceholder: "+7 (999) 123-45-67",
  phoneFormatHint: "Введите номер в формате +7 (XXX) XXX-XX-XX",
  requiredField: "Обязательное поле",
  submitCreate: "Создать",
  submitCreatePending: "Отправка…",
  save: "Сохранить",
  savePending: "Сохранение…",
  edit: "Изменить",
  cancel: "Отмена",
} as const;

export const ORD_STATIC_FIELDS_SX = { opacity: 0.58 };

export const ordContainedPrimarySx = {
  backgroundColor: PRIMARY_COLOR,
  "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 },
} as const;
