import assert from "node:assert/strict";
import { collectPages } from "../src/hooks/collectPages.ts";

const requested = [];
const all = await collectPages(async (page) => {
  requested.push(page);
  return {
    page, size: 100, total: 201, totalPages: 3,
    items: page === 3
      ? [{ username: "Алексей Попов", status: "waiting_for_review_materials" }]
      : Array.from({ length: 100 }, (_, index) => ({ username: `Участник ${page}-${index}`, status: "accepted" })),
  };
});
assert.deepEqual(requested, [1, 2, 3]);
assert.equal(all.items.length, 201);
assert.equal(all.items.filter((item) => item.username.toLocaleLowerCase("ru-RU").includes("попов")).length, 1);
assert.equal(all.items.filter((item) => item.status === "waiting_for_review_materials").length, 1);
assert.equal(all.total, 201);

// A failed later page must reject the query, not return a misleading first-page result.
await assert.rejects(collectPages(async (page) => {
  if (page === 2) throw new Error("Second page failed");
  return { page, totalPages: 2, items: [page] };
}), /Second page failed/);

// Bound iteration by the initial result even if a live collection grows while loading.
const growingPages = [];
await collectPages(async (page) => {
  growingPages.push(page);
  return { page, totalPages: page + 1, items: [page] };
});
assert.deepEqual(growingPages, [1, 2]);

// A backend that ignores the page parameter must not produce duplicated data.
await assert.rejects(collectPages(async () => ({ page: 1, totalPages: 2, items: ["first"] })), /Не удалось загрузить весь список/);
await assert.rejects(collectPages(async (page) => ({ page, totalPages: 2, items: page === 1 ? ["first"] : [] })), /Не удалось загрузить весь список/);
for (const totalPages of [Infinity, -1, 1.5]) {
  await assert.rejects(collectPages(async () => ({ page: 1, totalPages, items: [] })), /некорректная пагинация/);
}
assert.deepEqual((await collectPages(async () => ({ page: 1, totalPages: 0, items: [] }))).items, []);
console.log("Complete data: all pages, global matches, pending status, later-page failure and bounded iteration passed.");
