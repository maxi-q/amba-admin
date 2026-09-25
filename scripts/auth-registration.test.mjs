import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
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

// Exercise the merged hook itself: 409 recovery must keep skipAuth on both requests.
const requests = [];
let registrationError;
const modules = {
  "@tanstack/react-query": { useMutation: (options) => options },
  "react-router-dom": { useNavigate: () => () => {}, useLocation: () => ({}) },
  "@store/index": { useAuthStore: () => ({ login() {}, logout() {} }) },
  "./registerAndLogin": { registerAndLogin },
  "@/api/generated/auth/auth": {
    authControllerCreateProject: async (data, options) => {
      requests.push({ action: "register", data, options });
      if (registrationError) throw registrationError;
    },
    authControllerLogin: async (data, options) => {
      requests.push({ action: "login", data, options });
      return { token: "session-token" };
    },
  },
};
const compiled = ts.transpileModule(readFileSync(new URL("../src/hooks/auth/useRegisterProjectWithAuth.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
runInNewContext(compiled, { exports, require: (name) => {
  assert.ok(Object.hasOwn(modules, name), `Unexpected dependency: ${name}`);
  return modules[name];
} });
const { mutationFn } = exports.useRegisterProjectWithAuth();
const registerData = { groupId: 123, code: "test-code" };
const authData = { groupId: 123, userId: "1", context: "list_integration", sign: "test-sign" };
for (registrationError of [undefined, apiError(409)]) {
  requests.length = 0;
  assert.deepEqual(await mutationFn({ registerData, authData }), { token: "session-token" });
  assert.deepEqual(requests.map(({ action }) => action), ["register", "login"]);
  assert.equal(requests[0].data, registerData);
  assert.equal(requests[1].data, authData);
  for (const { options } of requests) assert.equal(options.skipAuth, true, "Never attach a saved session to sign-in requests");
}
registrationError = apiError(500);
requests.length = 0;
await assert.rejects(mutationFn({ registerData, authData }), (error) => error === registrationError);
assert.equal(requests.length, 1);
console.log("Merged auth hook: registration and login skip saved JWTs, recover 409, and stop on other errors.");
