export interface IGetRoomCreativeTasksRequest {
  page: number;
  size: number;
}
export interface ICreativeTask {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  description: string
  startsAt: string
  endsAt: string
  isDeleted: boolean
  isWhitelistEnabled: boolean
  roomId: string
}

export interface IGetRoomCreativeTasksResponse {
  items: ICreativeTask[],
  page: number
  size: number
  total: number
  totalPages: number
}

export type IGetCreativeTaskResponse = ICreativeTask

export interface IUpdateCreativeTaskRequest {
  title: string
  description: string
  startsAt: string
  endsAt: string
  isDeleted: boolean
  isWhitelistEnabled?: boolean
}

export type IUpdateCreativeTaskResponse = ICreativeTask

export interface ICreateCreativeTaskRequest {
  title: string
  description: string
  startsAt: string
  endsAt: string
  roomId: string
}

export type ICreateCreativeTaskResponse = ICreativeTask

export interface IGetSubmissionsRequest {
  page: number
  size: number
  status: 'pending' | 'approved' | 'rejected'
}

export interface ISubmission {
  id: string
  createdAt: string
  updatedAt: string
  content: string
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  reviewComment: string
  taskId: string
  ambassadorId: string
  /** Заполняется после одобрения заявки */
  rewardValue?: number | null
}
export interface IGetSubmissionsResponse {
  items: ISubmission[]
  page: number
  size: number
  total: number
  totalPages: number
}

export type IGetSubmissionResponse = ISubmission

export interface IUpdateSubmissionStatusRequest {
  status: 'pending' | 'approved' | 'rejected'
  reviewComment: string
  rewardValue: number
}

export type IUpdateSubmissionStatusResponse = ISubmission

/** Query: page, size (опционально, см. OpenAPI creative-tasks/{taskId}/whitelist GET) */
export interface IGetCreativeTaskWhitelistRequest {
  page?: number
  size?: number
}

/** Элемент вайтлиста (GET /creative-tasks/{taskId}/whitelist) */
export interface ICreativeTaskWhitelistItem {
  ambassadorId: string
  /** Если бэкенд отдаёт промокод в элементе вайтлиста */
  promoCode?: string
}

export interface IGetCreativeTaskWhitelistResponse {
  items: ICreativeTaskWhitelistItem[]
  page: number
  size: number
  total: number
  totalPages: number
}

/** POST /creative-tasks/{taskId}/whitelist */
export interface IAddToCreativeTaskWhitelistRequest {
  ambassadorId: string
}
