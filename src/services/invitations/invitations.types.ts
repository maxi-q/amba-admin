/** channelTypeId для цели приглашения; для ВК всегда 0 */
export const INVITATION_CHANNEL_TYPE_VK = 0 as const;

export interface IInvitationTarget {
  channelTypeId: number
  subscriberId: string
}

/** Приглашение после регистрации (см. OpenAPI /invitations) */
export interface IInvitation {
  id: string
  createdAt: string
  updatedAt: string
  roomId: string
  /** Подписчики ВК (id в ВК), вручную */
  targets: IInvitationTarget[]
  taskIds: string[]
  eventIds: string[]
}

export interface ICreateInvitationRequest {
  roomId: string
  targets: IInvitationTarget[]
  taskIds?: string[]
  eventIds?: string[]
}

export interface IUpdateInvitationRequest {
  targets?: IInvitationTarget[]
  taskIds?: string[]
  eventIds?: string[]
}

export type ICreateInvitationResponse = IInvitation
export type IUpdateInvitationResponse = IInvitation
