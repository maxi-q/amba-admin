export interface ILoginRequest {
  userId: string
  groupId: number
  context: string
  sign: string
}

export interface ILoginResponse {
  token: string
}

export interface IRegisterProjectRequest {
  groupId: number
  code: string
}

export interface IRegisterProjectResponse {
  id: string
  createdAt: string
  updatedAt: string
  groupId: number
  channelTypeId: number
  channelExternalId: string
}

export interface IAuthByTokenRequest {
  group_id: string
}

export interface IAuthByTokenResponse {
  id: string
  createdAt: string
  updatedAt: string
  groupId: number
  channelTypeId: number
  channelExternalId: string
}