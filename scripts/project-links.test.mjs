import assert from "node:assert/strict";
import { getProjectVkCommunityId, getSenlerSubscriptionUrl } from "../src/utils/projectLinks.ts";

const project = { provider: "SENLER_RU", channelTypeId: 1, channelExternalId: "-12345" };
assert.equal(getProjectVkCommunityId(project), "12345");
assert.equal(getProjectVkCommunityId({ ...project, provider: undefined }), "12345", "Keep VK links for older Senler.ru responses");
assert.equal(getProjectVkCommunityId({ ...project, provider: null }), undefined);
assert.equal(getProjectVkCommunityId({ ...project, provider: "UNKNOWN" }), undefined);
assert.equal(getProjectVkCommunityId({ ...project, provider: "SENLER_IO" }), undefined);
assert.equal(getProjectVkCommunityId({ ...project, channelTypeId: 2 }), undefined);
for (const channelExternalId of [null, "", "undefined", "null", "0", "../123", "javascript:alert(1)"]) {
  assert.equal(getProjectVkCommunityId({ ...project, channelExternalId }), undefined);
}
assert.equal(getProjectVkCommunityId(), undefined);
assert.equal(getSenlerSubscriptionUrl("12345", 42), "https://vk.com/app5898182_-12345#s=42&force=1");
assert.equal(getSenlerSubscriptionUrl(undefined, 42), "");
assert.equal(getSenlerSubscriptionUrl("null", 42), "");
for (const id of [undefined, null, 0, -1, 1.5, NaN, Infinity]) {
  assert.equal(getSenlerSubscriptionUrl("12345", id), "");
}
console.log("Project links: VK, Senler.io, nullable fields and invalid IDs passed.");
