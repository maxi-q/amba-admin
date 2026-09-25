import assert from "node:assert/strict";
import { ApiError } from "../src/types.ts";
import { registerAndLogin } from "../src/hooks/auth/registerAndLogin.ts";

function apiError(statusCode) {
  return new ApiError({
    statusCode, timestamp: "2026-09-24", path: "/api/auth/register",
    message: { message: `Error ${statusCode}`, error: "Error", statusCode },
  });
}

let loginCalls = 0;
const login = async () => { loginCalls++; return { token: "session-token" }; };
assert.deepEqual(await registerAndLogin(async () => {}, login), { token: "session-token" });
assert.equal(loginCalls, 1);
assert.deepEqual(await registerAndLogin(async () => { throw apiError(409); }, login), { token: "session-token" });
assert.equal(loginCalls, 2);
for (const error of [apiError(400), apiError(401), apiError(422), apiError(500), new Error("Network error")]) {
  await assert.rejects(registerAndLogin(async () => { throw error; }, login), (caught) => caught === error);
}
assert.equal(loginCalls, 2, "Never attempt login after failed registration other than 409");
const loginError = apiError(403);
await assert.rejects(registerAndLogin(
  async () => { throw apiError(409); },
  async () => { throw loginError; },
), (caught) => caught === loginError);
console.log("Auth registration: ApiError 409 logs in; other registration/login errors propagate.");
