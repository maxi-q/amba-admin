import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { newRewardUploadProgress, uploadRewardImages } from "../src/hooks/rewards/rewardUploadProgress.ts";

const upload = (key) => ({ url: `https://upload.invalid/${key}`, key, maxBytes: 1000, expiresIn: 60 });
const first = new File(["first"], "same-name.png", { type: "image/png" });
const second = new File(["second"], "same-name.png", { type: "image/png" });

function scenario(failure) {
  let fail = true;
  let reward = { photos: [] };
  const created = [];
  const uploaded = [];
  const confirmed = [];
  const notified = [];
  const actions = {
    createIconUpload: async () => upload("icon"),
    confirmIcon: async () => reward,
    createPhoto: async (file, sortOrder) => {
      const photoId = `photo-${created.length + 1}`;
      created.push({ file, photoId, sortOrder });
      return { photoId, upload: upload(photoId) };
    },
    upload: async (file) => {
      uploaded.push(file);
      if (file === second && failure === "upload" && fail) {
        fail = false;
        throw new Error("Upload interrupted");
      }
    },
    confirmPhoto: async (photoId) => {
      confirmed.push(photoId);
      if (photoId === "photo-2" && failure === "confirm" && fail) {
        fail = false;
        throw new Error("Confirmation interrupted");
      }
      const photo = created.find((item) => item.photoId === photoId);
      if (!reward.photos.some((item) => item.id === photoId)) {
        reward = { photos: [...reward.photos, { id: photoId, sortOrder: photo.sortOrder }] };
      }
      return reward;
    },
    onPhotoConfirmed: (file) => notified.push(file),
  };
  return { actions, created, uploaded, confirmed, notified, reward: () => reward };
}

for (const failure of ["upload", "confirm"]) {
  const test = scenario(failure);
  const progress = newRewardUploadProgress();
  await assert.rejects(uploadRewardImages(test.reward(), null, [first, second], progress, test.actions));
  assert.equal(progress.photos.get(first).confirmed, true);
  assert.equal(progress.photos.get(second).photoId, "photo-2");
  assert.equal(progress.photos.get(second).confirmed, false);
  const result = await uploadRewardImages(test.reward(), null, [first, second], progress, test.actions);
  assert.equal(result.photos.length, 2);
  assert.equal(test.created.length, 2, "Retry reuses both server IDs");
  assert.equal(test.uploaded.filter((file) => file === first).length, 1);
  assert.equal(test.uploaded.filter((file) => file === second).length, failure === "upload" ? 2 : 1);
  assert.deepEqual(test.notified, [first, second], "Only confirmed File identities leave the pending form");
  assert.equal(test.confirmed.filter((id) => id === "photo-1").length, 1);

  const sameFilenameNewFile = new File(["third"], "same-name.png", { type: "image/png" });
  await uploadRewardImages(test.reward(), null, [sameFilenameNewFile], progress, test.actions);
  assert.equal(test.created.length, 3, "Different File objects with the same name remain distinct photos");
}

const progress = newRewardUploadProgress();
const icon = new File(["icon"], "icon.png", { type: "image/png" });
progress.rewardId = "already-created-reward";
progress.icon = { file: icon, upload: upload("initial-icon"), uploaded: false, confirmed: false };
const iconTest = scenario("none");
let iconUploadCalls = 0;
let iconConfirmCalls = 0;
const iconActions = {
  ...iconTest.actions,
  createIconUpload: async () => { throw new Error("Must reuse the existing upload"); },
  upload: async () => { iconUploadCalls += 1; },
  confirmIcon: async () => {
    iconConfirmCalls += 1;
    if (iconConfirmCalls === 1) throw new Error("Confirmation interrupted");
    return iconTest.reward();
  },
};
await assert.rejects(uploadRewardImages(iconTest.reward(), icon, [], progress, iconActions));
await uploadRewardImages(iconTest.reward(), icon, [], progress, iconActions);
assert.equal(iconUploadCalls, 1);
assert.equal(iconConfirmCalls, 2);
assert.equal(progress.rewardId, "already-created-reward");
assert.equal(progress.icon.confirmed, true);

const hookSource = readFileSync(new URL("../src/hooks/rewards/useRewardMutations.ts", import.meta.url), "utf8");
assert.match(hookSource, /if \(progress\.current\.rewardId\)/);
assert.doesNotMatch(hookSource, /rewardsControllerDelete(?:Reward|Photo)\([^\n]*\.catch/);
console.log("Reward uploads: partial upload/confirmation retries, retained IDs, distinct File identities and no destructive rollback passed.");
