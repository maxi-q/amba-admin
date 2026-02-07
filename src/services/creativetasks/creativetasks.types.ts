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
}
export interface IGetSubmissionsResponse {
  items: ISubmission[]
  page: number
  size: number
  total: number
  totalPages: number
}

export type IGetSubmissionResponse = ISubmission