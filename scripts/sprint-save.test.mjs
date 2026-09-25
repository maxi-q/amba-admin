import assert from "node:assert/strict";
import { saveSprintWithRelations } from "../src/pages/(list_integration)/sprints/slug/saveSprintWithRelations.ts";

function fixture() {
  const calls = [];
  let taskCount = 0;
  let ruleCount = 0;
  let currentSprint = { id: "saved-sprint", roomId: "room", isDraft: true };
  let fail = () => false;
  const record = (operation, id, data) => {
    calls.push({ operation, id, data });
    if (fail(operation, id, data)) throw new Error("simulated failure");
  };
  const actions = {
    async createSprint(data) {
      record("createSprint", undefined, data);
      return currentSprint;
    },
    async updateSprint({ sprintId, data }) {
      record("updateSprint", sprintId, data);
      currentSprint = { ...currentSprint, ...data };
      return currentSprint;
    },
    async createRule({ data }) {
      record("createRule", undefined, data);
      return { id: `rule-${++ruleCount}` };
    },
    async updateRule({ id, data }) { record("updateRule", id, data); },
    async deleteRule(id) { record("deleteRule", id); },
    async createTask(data) {
      record("createTask", undefined, data);
      return { id: `task-${++taskCount}` };
    },
    async updateTask({ id, data }) { record("updateTask", id, data); },
  };
  const options = {
    progress: { ruleIds: {}, taskIds: {} },
    roomId: "room",
    data: { name: "Sprint", isDraft: false },
    publish: true,
    rules: [{ key: "local-rule", data: { type: "manual", rewards: [{ rewardId: "reward", amount: 1 }] } }],
    tasks: ["first", "second"].map((key) => ({
      key,
      createData: { title: key, roomId: "room", sprintId: "" },
      updateData: { title: key },
    })),
    actions,
  };
  return {
    calls,
    options,
    setFailure: (predicate) => { fail = predicate; },
    setPublished: () => { currentSprint.isDraft = false; },
  };
}

// The second task fails after the sprint, reward rule, and first task were created.
const partial = fixture();
partial.setFailure((operation, _id, data) => operation === "createTask" && data.title === "second");
await assert.rejects(saveSprintWithRelations(partial.options), /simulated failure/);
assert.deepEqual(partial.options.progress, {
  sprintId: "saved-sprint",
  ruleIds: { "local-rule": "rule-1" },
  taskIds: { first: "task-1" },
});
assert.equal(partial.calls[0].data.isDraft, true);
assert.ok(!partial.calls.some((call) => call.data?.isDraft === false));
partial.setFailure(() => false);
await saveSprintWithRelations(partial.options);
assert.equal(partial.calls.filter((call) => call.operation === "createSprint").length, 1);
assert.equal(partial.calls.filter((call) => call.operation === "createRule").length, 1);
assert.equal(partial.calls.filter((call) => call.operation === "createTask" && call.data.title === "first").length, 1);
assert.ok(partial.calls.some((call) => call.operation === "updateTask" && call.id === "task-1"));
assert.deepEqual(partial.calls.at(-1), { operation: "updateSprint", id: "saved-sprint", data: { isDraft: false } });

// Even settings validation failing immediately after creation must retain the draft ID.
const settings = fixture();
settings.setFailure((operation) => operation === "updateSprint");
await assert.rejects(saveSprintWithRelations(settings.options));
assert.equal(settings.options.progress.sprintId, "saved-sprint");
settings.setFailure(() => false);
await saveSprintWithRelations(settings.options);
assert.equal(settings.calls.filter((call) => call.operation === "createSprint").length, 1);

// Save draft, then publish: confirmed relations are updated, never recreated.
const draft = fixture();
draft.options.publish = false;
await saveSprintWithRelations(draft.options);
assert.ok(!draft.calls.some((call) => call.data?.isDraft === false));
draft.options.publish = true;
await saveSprintWithRelations(draft.options);
assert.equal(draft.calls.filter((call) => call.operation === "createSprint").length, 1);
assert.equal(draft.calls.filter((call) => call.operation === "createTask").length, 2);
assert.equal(draft.calls.filter((call) => call.operation === "createRule").length, 1);

// Do not delete old data until ALL replacement upserts succeed. Remember each deletion.
const removal = fixture();
removal.options.progress = {
  sprintId: "saved-sprint",
  ruleIds: { old: "old-rule" },
  taskIds: { old: "old-task" },
};
removal.setFailure((operation) => operation === "createTask");
await assert.rejects(saveSprintWithRelations(removal.options));
assert.ok(!removal.calls.some((call) => call.operation === "deleteRule" || call.data?.isDeleted));
removal.setFailure((operation, id) => operation === "updateTask" && id === "old-task");
await assert.rejects(saveSprintWithRelations(removal.options));
assert.equal(removal.options.progress.ruleIds.old, undefined);
assert.equal(removal.options.progress.taskIds.old, "old-task");
removal.setFailure(() => false);
await saveSprintWithRelations(removal.options);
assert.equal(removal.calls.filter((call) => call.operation === "deleteRule").length, 1);
assert.equal(removal.options.progress.taskIds.old, undefined);

// Saving an existing active sprint must not try to turn it back into a draft.
const active = fixture();
active.setPublished();
active.options.progress.sprintId = "saved-sprint";
await saveSprintWithRelations(active.options);
assert.ok(!active.calls.some((call) => call.operation === "createSprint" || "isDraft" in (call.data ?? {})));

// Reject invalid hydrated/bypassed rules before any server write; unrestricted byPoints is valid.
for (const invalid of [
  { type: "byRank", rankFrom: 0, rankTo: 3 },
  { type: "byRank", rankFrom: 5, rankTo: 2 },
  { type: "byPoints", rankFrom: 2, rankTo: 5 },
  { type: "byPoints", rankTo: 0 },
  { type: "byPoints", minPoints: -1 },
  { type: "manual", rewards: [{ rewardId: "reward", amount: Number.NaN }] },
]) {
  const invalidSave = fixture();
  Object.assign(invalidSave.options.rules[0].data, invalid);
  await assert.rejects(saveSprintWithRelations(invalidSave.options));
  assert.equal(invalidSave.calls.length, 0);
}
const unbounded = fixture();
Object.assign(unbounded.options.rules[0].data, { type: "byPoints", rankFrom: null, rankTo: null, minPoints: null });
await saveSprintWithRelations(unbounded.options);
assert.equal(unbounded.calls.filter((call) => call.operation === "createRule").length, 1);

console.log("Sprint save: draft-first publication, checkpoints, partial failures, safe retry and deferred deletions passed.");
