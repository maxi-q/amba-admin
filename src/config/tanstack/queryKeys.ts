export enum QueryKeys {
  ROOMS = 'rooms',
  EVENTS = 'events',
  SPRINTS = 'sprints',
  PROJECT = 'project',
  AMBASSADORS = 'ambassadors',
  ROOM_APPLICATIONS = 'roomApplications',
  EVENT_APPLICATIONS = 'eventApplications',
  BOTS = 'bots',

  CREATIVE_TASKS = 'creativeTasks',
  CREATIVE_TASK = 'creativeTask',
  PRIVATE_CREATIVE_TASKS = 'privateCreativeTasks',
  PRIVATE_CREATIVE_TASK = 'privateCreativeTask',
  SUBMISSIONS = 'submissions',
  SUBMISSION = 'submission',
  CREATIVE_TASK_WHITELIST = 'creativeTaskWhitelist',

  INVITATIONS = 'invitations',

  /** GET rooms/:roomId/ord-contracts, GET .../:contractId */
  ROOM_ORD_CONTRACTS = 'roomOrdContracts',

  REWARDS = 'rewards',
  SPRINT_REWARD_RULES = 'sprintRewardRules',
  SPRINT_LEADERBOARD = 'sprintLeaderboard',
}