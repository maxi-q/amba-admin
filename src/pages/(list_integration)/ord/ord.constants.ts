import type {
  CreateRoomOrdContractRequestDtoActionType,
  CreateRoomOrdContractRequestDtoSubjectType,
  CreateRoomOrdContractRequestDtoType,
  CreateRoomOrdProfileRequestDtoJuridicalType,
} from "@/api/generated/model";

export type OrdJuridicalType = CreateRoomOrdProfileRequestDtoJuridicalType;
export type OrdContractType = CreateRoomOrdContractRequestDtoType;
export type OrdContractActionType = CreateRoomOrdContractRequestDtoActionType;
export type OrdContractSubjectType = CreateRoomOrdContractRequestDtoSubjectType;

export const ORD_JURIDICAL_OPTIONS: { value: OrdJuridicalType; label: string }[] = [
  { value: "physical", label: "Физ. лицо" },
  { value: "ip", label: "ИП" },
  { value: "juridical", label: "Юр. лицо" },
];

export const ORD_CONTRACT_TYPE_OPTIONS: { value: OrdContractType; label: string }[] = [
  { value: "service", label: "Оказание услуг" },
  { value: "mediation", label: "Посредничество" },
  { value: "additional", label: "Дополнительный" },
];

export const ORD_CONTRACT_ACTION_OPTIONS: { value: OrdContractActionType; label: string }[] = [
  { value: "distribution", label: "Распространение" },
  { value: "conclude", label: "Заключение" },
  { value: "commercial", label: "Коммерческая" },
  { value: "other", label: "Иное" },
];

export const ORD_CONTRACT_SUBJECT_OPTIONS: { value: OrdContractSubjectType; label: string }[] = [
  { value: "representation", label: "Представительство" },
  { value: "org_distribution", label: "Орг. распространение" },
  { value: "mediation", label: "Посредничество" },
  { value: "distribution", label: "Распространение" },
  { value: "other", label: "Иное" },
];

export const ORD_COPY = {
  pageTitle: "ОРД",
  contractsTitle: "Договоры ОРД",
  templatesTitle: "Шаблоны договоров ОРД",
  autoIssuanceTitle: "Автовыпуск ORD-договоров",
  filesTitle: "ORD-файлы комнаты",
  profileTab: "Профиль ОРД",
  contractsTab: "Договоры",
  templatesTab: "Шаблоны",
  autoIssuanceTab: "Автовыпуск",
  filesTab: "Файлы",
  createContract: "Создать договор",
  createTemplate: "Создать шаблон",
  addOrdFile: "Добавить ORD-файл",
  editTemplate: "Изменить шаблон",
  noTemplates: "Шаблонов пока нет",
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
