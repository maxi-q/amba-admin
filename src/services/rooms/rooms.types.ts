
export interface ICreateRoomRequest {
  name: string;
  webhookUrl: string | null;
}

export interface IRoomData {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  webhookUrl: string,
  secretKey: string,
  isDeleted: boolean,
  projectId: string,
  notificationCreativeTaskApprovedBotId?: string,
  notificationCreativeTaskRejectedBotId?: string,
}

export type ICreateRoomResponse = IRoomData

export type IGetRoomResponse = IRoomData

export interface IUpdateRoomsRequest {
  name?: string,
  webhookUrl?: string,
  notificationCreativeTaskApprovedBotId?: string,
  notificationCreativeTaskRejectedBotId?: string,
  isDeleted?: boolean
}

export type IUpdateRoomsResponse = IRoomData


export interface IGetRoomByIdResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  webhookUrl: string,
  secretKey: string,
  isDeleted: boolean,
  projectId: string,
  notificationCreativeTaskApprovedBotId?: string,
  notificationCreativeTaskRejectedBotId?: string,
  /** GET /rooms/:id — профиль ОРД (OrdPerson), см. RoomOrdProfileResponseDto */
  ordPerson: IRoomOrdProfile | null,
}

export type IRotateSecretKeyResponse = string

export interface IGetRoomAnalyticsRequest {
  ambassadorId?: string[];
  eventId?: string[];
  sprintId?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface IGetRoomAnalyticsResponse {
  items: {
    date: string;
    count: number;
  }[];
  total: number;
}

export interface IGetRoomPromoCodeUsagesRequest {
  ambassadorId?: string[];
  eventId?: string[];
  sprintId?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

export interface IGetRoomPromoCodeUsagesResponse {
  items: {
    id: string;
    projectId: string;
    roomId: string;
    sprintId: string;
    eventId: string;
    ambassadorId: string;
    uniqueId: string;
    additionalUniqueId: string;
    payload: object;
    createdAt: string;
  }[],
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/** Соответствует Prisma OrdJuridicalType / backend CreateRoomOrdProfileRequestDto */
export type IOrdJuridicalType = 'physical' | 'ip' | 'juridical';

/** Ответ POST / PUT rooms/:id/ord-profile и поле ordPerson в GET /rooms/:id — RoomOrdProfileResponseDto */
export interface IRoomOrdProfile {
  id: string;
  inn: string;
  name: string;
  phone: string;
  juridicalType: IOrdJuridicalType;
  syncedAt: string | null;
  lastSyncError: string | null;
}

/** Тело POST rooms/:id/ord-profile — CreateRoomOrdProfileRequestDto */
export interface ICreateRoomOrdProfileRequest {
  inn: string;
  name: string;
  phone: string;
  juridicalType: IOrdJuridicalType;
}

/** Тело PUT rooms/:id/ord-profile — UpdateRoomOrdProfileRequestDto */
export interface IUpdateRoomOrdProfileRequest {
  name?: string;
  phone?: string;
}

/** Prisma OrdContractType */
export type IOrdContractType = 'service' | 'mediation' | 'additional';

/** Prisma OrdContractActionType */
export type IOrdContractActionType = 'distribution' | 'conclude' | 'commercial' | 'other';

/** Prisma OrdContractSubjectType */
export type IOrdContractSubjectType =
  | 'representation'
  | 'org_distribution'
  | 'mediation'
  | 'distribution'
  | 'other';

/** Prisma OrdContractFlag */
export type IOrdContractFlag =
  | 'vat_included'
  | 'contractor_is_creatives_reporter'
  | 'agent_acting_for_publisher'
  | 'is_charge_paid_by_agent';

export interface IOrdContractPerson {
  id: string;
  inn: string;
  name: string;
}

/** Элемент GET/POST rooms/:roomId/ord-contracts — RoomOrdContractItemDto */
export interface IRoomOrdContractItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  lastSyncError: string | null;
  type: IOrdContractType;
  date: string;
  dateEnd: string | null;
  amount: string | null;
  actionType: IOrdContractActionType | null;
  subjectType: IOrdContractSubjectType | null;
  flags: IOrdContractFlag[];
  clientOrdPerson: IOrdContractPerson;
  contractorOrdPerson: IOrdContractPerson;
}

export interface IGetRoomOrdContractsRequest {
  page?: number;
  size?: number;
}

export interface IGetRoomOrdContractsResponse {
  items: IRoomOrdContractItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/** Тело POST rooms/:roomId/ord-contracts — CreateRoomOrdContractRequestDto */
export interface ICreateRoomOrdContractRequest {
  ambassadorRoomId: string;
  type: IOrdContractType;
  /** Дата заключения (YYYY-MM-DD или ISO) */
  date: string;
  dateEnd?: string;
  amount?: string;
  actionType?: IOrdContractActionType;
  subjectType?: IOrdContractSubjectType;
  flags?: IOrdContractFlag[];
}