import { PRIMARY_COLOR } from "@/constants/colors";
import type {
  IOrdContractActionType,
  IOrdContractSubjectType,
  IOrdContractType,
  IOrdJuridicalType,
} from "@services/rooms/rooms.types";

export const ORD_JURIDICAL_OPTIONS: { value: IOrdJuridicalType; label: string }[] = [
  { value: "physical", label: "Физ. лицо" },
  { value: "ip", label: "ИП" },
  { value: "juridical", label: "Юр. лицо" },
];

export const ORD_CONTRACT_TYPE_OPTIONS: { value: IOrdContractType; label: string }[] = [
  { value: "service", label: "Оказание услуг" },
  { value: "mediation", label: "Посредничество" },
  { value: "additional", label: "Дополнительный" },
];

export const ORD_CONTRACT_ACTION_OPTIONS: { value: IOrdContractActionType; label: string }[] = [
  { value: "distribution", label: "Распространение" },
  { value: "conclude", label: "Заключение" },
  { value: "commercial", label: "Коммерческая" },
  { value: "other", label: "Иное" },
];

export const ORD_CONTRACT_SUBJECT_OPTIONS: { value: IOrdContractSubjectType; label: string }[] = [
  { value: "representation", label: "Представительство" },
  { value: "org_distribution", label: "Орг. распространение" },
  { value: "mediation", label: "Посредничество" },
  { value: "distribution", label: "Распространение" },
  { value: "other", label: "Иное" },
];

export const ORD_COPY = {
  pageTitle: "ОРД",
  contractsTitle: "Договоры ОРД",
  profileTab: "Профиль ОРД",
  contractsTab: "Договоры",
  createContract: "Создать договор",
  noOrdProfileHint: "Чтобы работать с договорами, сначала создайте профиль ОРД комнаты.",
  noContracts: "Договоров пока нет",
  contractor: "Исполнитель",
  client: "Заказчик",
  contractDetail: "Договор",
  deleteContract: "Удалить",
  openContract: "Открыть",
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
