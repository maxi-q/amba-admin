import assert from "node:assert/strict";
import { build } from "esbuild";
import { answersLabel, getSubmissionCounts } from "../src/pages/(list_integration)/creativetasks/submissionStatus.ts";

const statuses = ["new", "waiting_for_review_materials", "rejected_for_materials", "waiting_for_publication", "waiting_for_review_publication", "rejected_for_publication", "approved"];
const counts = getSubmissionCounts(statuses.map((status) => ({ status })));
assert.equal(counts.review, 2);
assert.equal(counts.inWork, 4);
assert.equal(counts.approved, 1);
assert.equal(counts.review + counts.inWork + counts.approved, counts.total);
assert.equal(counts.byStatus.new, 1);
assert.equal(getSubmissionCounts([{ status: "new" }]).review, 0, "Drafts must not look like submitted answers");
assert.equal(getSubmissionCounts([{ status: "waiting_for_publication" }]).inWork, 1, "Awaiting publication is not fully reviewed");
assert.deepEqual(getSubmissionCounts([]), { byStatus: {}, review: 0, inWork: 0, approved: 0, total: 0 });
for (const [count, label] of [[1, "1 ответ"], [2, "2 ответа"], [11, "11 ответов"], [12, "12 ответов"], [21, "21 ответ"], [24, "24 ответа"], [25, "25 ответов"]]) assert.equal(answersLabel(count), label);
console.log("Task counters: all statuses partitioned, no draft-as-answer or publication-as-approved, plural forms passed.");

// Resolve the app's TS aliases in memory; exercise the same DTO mapper used by both forms.
const bundle = await build({ entryPoints: ["src/pages/(list_integration)/sprints/slug/components/draftSprintTask.ts"], bundle: true, write: false, platform: "node", format: "esm", tsconfig: "tsconfig.app.json" });
const { creativeTaskToDraft, draftTaskToCreatePayload, draftTaskToUpdatePayload } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const task = {
  id: "task", title: "Название", description: "Описание", restrictions: ["Запрет"], criteria: ["Критерий"],
  allowedFormats: ["VIDEO"], targetPlatform: "VK_USER", minimalRewardInBalls: 700,
  ordForm: "video", ordKktus: ["1.1"], ordContractTemplateId: "contract",
  defaultMediaIds: ["media"], defaultTexts: ["Текст"], defaultTargetUrls: ["https://example.com/"],
  allowAmbassadorMedia: false, allowAmbassadorText: false, allowAmbassadorTargetUrl: false,
  publicationsCount: 3, requireMaterialsReview: false, requirePublicationReview: true,
};
const draft = creativeTaskToDraft(task);
const created = draftTaskToCreatePayload(draft, "room", "sprint");
assert.equal(created.roomId, "room");
assert.equal(created.sprintId, "sprint");
assert.equal(created.ordPayType, "other");
for (const key of Object.keys(task).filter((key) => key !== "id")) assert.deepEqual(created[key], task[key], `Preserve ${key}`);
const updated = draftTaskToUpdatePayload(draft, "sprint");
assert.ok(!Object.hasOwn(updated, "roomId"));
assert.ok(!Object.hasOwn(updated, "ordPayType"), "Do not replace the backend's existing payment type during editing");
assert.equal(updated.publicationsCount, 3);
draft.defaultMediaIds.push("second");
assert.deepEqual(task.defaultMediaIds, ["media"], "Form edits must not mutate cached backend data");
console.log("Task form: required ORD fields, defaults, platform, review settings and publication count survive DTO round trips.");
