export interface IGetProjectResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  channelTypeId: number,
  channelExternalId: string,
  avatarUrl: string
}

export interface IBotItem {
  bot_id: string
  title: string
  date: string
  active: string
  published: string
  tags: string[]
}

export interface IGetBotsResponse {
  items: IBotItem[]
  count: number
}