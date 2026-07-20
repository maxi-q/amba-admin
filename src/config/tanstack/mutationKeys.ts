export enum MutationKeys {
  CREATE_ROOM = 'createRoom',
  UPDATE_ROOM = 'updateRoom',
  DELETE_ROOM = 'deleteRoom',
  ROTATE_SECRET_KEY = 'rotateSecretKey',

  CREATE_ROOM_ORD_PROFILE = 'createRoomOrdProfile',
  UPDATE_ROOM_ORD_PROFILE = 'updateRoomOrdProfile',

  CREATE_ROOM_ORD_CONTRACT = 'createRoomOrdContract',
  REQUEST_ROOM_ORD_CONTRACT_CID = 'requestRoomOrdContractCid',
  DELETE_ROOM_ORD_CONTRACT = 'deleteRoomOrdContract',

  CREATE_SPRINT = 'createSprint',
  PATCH_SPRINT = 'patchSprint',

  CREATE_EVENT = 'createEvent',
  PATCH_EVENT = 'patchEvent',

  EVENTS = 'events',
  SPRINTS = 'sprints',

  APPROVE_ROOM_APPLICATIONS = 'approveRoomApplications',
  APPROVE_EVENT_APPLICATIONS = 'approveEventApplications',
  APPROVE_ALL_PENDING_ROOM_APPLICATIONS = 'approveAllPendingRoomApplications',

  CREATE_CREATIVE_TASK = 'createCreativeTask',
  UPDATE_CREATIVE_TASK = 'updateCreativeTask',
  CREATE_PRIVATE_CREATIVE_TASK = 'createPrivateCreativeTask',
  UPDATE_PRIVATE_CREATIVE_TASK = 'updatePrivateCreativeTask',
  UPDATE_SUBMISSION_STATUS = 'updateSubmissionStatus',
  ADD_CREATIVE_TASK_WHITELIST = 'addCreativeTaskWhitelist',
  REMOVE_CREATIVE_TASK_WHITELIST = 'removeCreativeTaskWhitelist',

  CREATE_INVITATION = 'createInvitation',
  UPDATE_INVITATION = 'updateInvitation',
  DELETE_INVITATION = 'deleteInvitation',

  CREATE_REWARD = 'createReward',
  UPDATE_REWARD = 'updateReward',
  DELETE_REWARD = 'deleteReward',

  CREATE_SPRINT_REWARD_RULE = 'createSprintRewardRule',
  UPDATE_SPRINT_REWARD_RULE = 'updateSprintRewardRule',
  DELETE_SPRINT_REWARD_RULE = 'deleteSprintRewardRule',
}