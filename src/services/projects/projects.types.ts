export type ProjectProvider = 'SENLER_RU' | 'SENLER_IO';

export interface IGetProjectResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  // Older Senler.ru backends omit provider during a rolling deployment.
  provider?: ProjectProvider,
  senlerIoProjectId?: string | null,
  groupId?: number | null,
  channelTypeId: number | null,
  channelExternalId: string | null,
  avatarUrl: string | null
}

export const supportsSenlerRuAutomation = (project?: IGetProjectResponse) =>
  !!project && (project.provider === undefined || project.provider === 'SENLER_RU');

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
