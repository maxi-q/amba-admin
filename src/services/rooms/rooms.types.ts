export interface ICreateRoomRequest {
  name: string;
  webhookUrl: string;
  secretKey: string;
}

export interface ICreateRoomResponse {
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "createdAt": "2025-07-27T00:35:48.938Z",
  "updatedAt": "2025-07-27T00:35:48.938Z",
  "name": "string",
  "pendingSubscriptionId": 0,
  "approvedSubscriptionId": 0,
  "rejectedSubscriptionId": 0,
  "webhookUrl": "string",
  "secretKey": "string",
  "isDeleted": true,
  "projectId": "string"
}