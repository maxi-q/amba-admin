import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const project = { id: 'project', provider: 'SENLER_IO', senlerIoProjectId: 'remote' };
const jwt = (expiresIn, sub = 'project') => `header.${Buffer.from(JSON.stringify({
  exp: Math.floor(Date.now() / 1000) + expiresIn, sub,
})).toString('base64url')}.signature`;
const failure = status => Object.assign(new Error(`HTTP ${status}`), {
  isAxiosError: true, response: { status, data: {} },
});
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

// Execute the real TS modules with isolated browser storage and a mock HTTP
// transport. No browser test framework or requests to a real API are needed.
function browser({ token = jwt(-1), search = '', refreshToken = 'initial-refresh', transport, storage } = {}) {
  const values = storage ?? new Map([
    ['token', token], ['authProvider', 'SENLER_IO'],
    ['senlerIoRefreshSession', JSON.stringify({ id: 'login-1', refreshToken })],
  ]);
  const localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const calls = [];
  const send = async config => {
    calls.push(config);
    return { data: await transport(config) };
  };
  const axios = {
    create: () => ({ request: send, post: (url, data) => send({ url, data, method: 'POST' }) }),
    isAxiosError: error => error?.isAxiosError === true,
  };
  const globals = { localStorage, window: { location: { search } }, navigator: {},
    URLSearchParams, atob, crypto: { randomUUID }, console, setTimeout, clearTimeout };
  const cache = new Map();
  function load(specifier, from = path.join(root, 'entry.ts')) {
    if (specifier === 'axios') return axios;
    if (specifier === '@/constants') return { getApiBaseUrl: () => 'https://api.example',
      getApiEndpointUrl: endpoint => `https://api.example/api/${endpoint}` };
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return require(specifier);
    let filename = specifier.startsWith('@/')
      ? path.join(root, 'src', specifier.slice(2)) : path.resolve(path.dirname(from), specifier);
    filename = [filename, `${filename}.ts`, path.join(filename, 'index.ts')]
      .find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!filename) throw new Error(`Cannot load ${specifier}`);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    });
    vm.runInNewContext(`(function(exports, require, module) { ${outputText}\n})`, globals, { filename })(
      module.exports, dependency => load(dependency, filename), module,
    );
    return module.exports;
  }
  return { storage: values, localStorage, calls, globals, load, ...load('@/api/mutator/custom-instance'),
    ...load('@/store'), ...load('@/services/auth/senler-io-session') };
}

test('expired JWT refreshes once for concurrent requests and uses the rotated pair', async () => {
  const gate = deferred();
  const newToken = jwt(3600);
  const app = browser({ transport: async config => {
    if (config.url.endsWith('/refresh')) {
      await gate.promise;
      assert.equal(config.headers?.Authorization, undefined);
      assert.equal(config.data.refreshToken, 'initial-refresh');
      return { token: newToken, refreshToken: 'rotated-refresh', project };
    }
    assert.equal(config.headers.Authorization, `Bearer ${newToken}`);
    return 'ok';
  } });
  const first = app.customInstance({ url: '/api/projects' });
  const second = app.customInstance({ url: '/api/rooms' });
  gate.resolve();
  assert.deepEqual(await Promise.all([first, second]), ['ok', 'ok']);
  assert.equal(app.calls.filter(call => call.url.endsWith('/refresh')).length, 1);
  assert.equal(JSON.parse(app.localStorage.getItem('senlerIoRefreshSession')).refreshToken, 'rotated-refresh');
});

test('401 refreshes and retries a request only once', async () => {
  let requests = 0;
  const app = browser({ token: jwt(3600), transport: async config => {
    if (config.url.endsWith('/refresh')) return { token: jwt(7200), refreshToken: 'next', project };
    requests++;
    throw failure(401);
  } });
  await assert.rejects(app.customInstance({ url: '/api/projects' }));
  assert.equal(requests, 2);
  assert.equal(app.calls.filter(call => call.url.endsWith('/refresh')).length, 1);
  assert.equal(app.localStorage.getItem('token'), null);
});

test('Web Locks serialize rotation across tabs sharing one browser session', async () => {
  let refreshes = 0;
  const newToken = jwt(3600);
  const transport = async config => {
    if (config.url.endsWith('/refresh')) {
      refreshes++;
      return { token: newToken, refreshToken: 'rotated-once', project };
    }
    assert.equal(config.headers.Authorization, `Bearer ${newToken}`);
    return 'ok';
  };
  let queue = Promise.resolve();
  const locks = { request: (_name, callback) => {
    const result = queue.then(callback);
    queue = result.catch(() => {});
    return result;
  } };
  const first = browser({ transport });
  const second = browser({ transport, storage: first.storage });
  first.globals.navigator.locks = second.globals.navigator.locks = locks;
  assert.deepEqual(await Promise.all([
    first.customInstance({ url: '/api/projects' }), second.customInstance({ url: '/api/projects' }),
  ]), ['ok', 'ok']);
  assert.equal(refreshes, 1);
});

test('a session issued before refresh support falls back to login after 401', async () => {
  const app = browser({ transport: async () => { throw failure(401); } });
  app.localStorage.removeItem('senlerIoRefreshSession');
  await assert.rejects(app.customInstance({ url: '/api/projects' }));
  assert.equal(app.calls.length, 1);
  assert.equal(app.useAuthStore.getState().auth, false);
});

test('a temporary refresh failure preserves the session for a later request', async () => {
  let attempts = 0;
  const app = browser({ transport: async config => {
    if (!config.url.endsWith('/refresh')) return 'ok';
    if (++attempts === 1) throw failure(502);
    return { token: jwt(3600), refreshToken: 'next', project };
  } });
  await assert.rejects(app.customInstance({ url: '/api/projects' }));
  assert.equal(app.localStorage.getItem('authProvider'), 'SENLER_IO');
  assert.equal(await app.customInstance({ url: '/api/projects' }), 'ok');
  assert.equal(attempts, 2);
});

test('revoked refresh clears credentials and never sends the protected request', async () => {
  const app = browser({ transport: async () => { throw failure(403); } });
  await assert.rejects(app.customInstance({ url: '/api/projects' }));
  assert.equal(app.calls.length, 1);
  assert.equal(app.localStorage.getItem('senlerIoRefreshSession'), null);
  assert.equal(app.useAuthStore.getState().auth, false);
});

test('public OAuth exchange never attaches or refreshes an expired JWT', async () => {
  const app = browser({ transport: async () => ({ token: 'login' }) });
  await app.customInstance({ url: '/api/auth/senler-io/exchange', method: 'POST' }, { skipAuth: true });
  assert.equal(app.calls.length, 1);
  assert.equal(app.calls[0].headers.Authorization, undefined);
});

test('an in-flight refresh cannot resurrect logout or overwrite another login', async () => {
  for (const switchProject of [false, true]) {
    const gate = deferred();
    const app = browser({ transport: async () => {
      await gate.promise;
      return { token: jwt(3600), refreshToken: 'next', project };
    } });
    const request = app.customInstance({ url: '/api/projects' });
    const nextToken = jwt(3600, 'other-project');
    if (switchProject) app.useAuthStore.getState().login(nextToken, 'SENLER_IO', 'other-refresh');
    else app.useAuthStore.getState().logout();
    gate.resolve();
    await assert.rejects(request, /Сессия изменилась/);
    assert.equal(app.localStorage.getItem('token'), switchProject ? nextToken : null);
    assert.equal(app.calls.length, 1);
  }
});

test('a delayed 401 from an old login cannot clear a new login even with the same JWT', async () => {
  const gate = deferred();
  const token = jwt(3600);
  const app = browser({ token, transport: async () => { await gate.promise; throw failure(401); } });
  const request = app.customInstance({ url: '/api/projects' });
  await Promise.resolve();
  app.useAuthStore.getState().login(token, 'SENLER_IO', 'new-login-refresh');
  gate.resolve();
  await assert.rejects(request);
  assert.equal(app.localStorage.getItem('token'), token);
  assert.equal(app.useAuthStore.getState().auth, true);
});

const launch = expiresIn => Buffer.from(JSON.stringify({ expires_at: Math.floor(Date.now() / 1000) + expiresIn }))
  .toString('base64url') + '.signature';

test('embedded restoration refreshes first but stays unauthenticated until project binding succeeds', async () => {
  const token = jwt(3600);
  const app = browser({ search: `?launch_code=${launch(110)}`, transport: async config => {
    if (config.url.endsWith('/refresh')) return { token, refreshToken: 'next', project };
    assert.equal(config.headers.Authorization, `Bearer ${token}`);
    return { project };
  } });
  const [first, second] = await Promise.all([app.resumeSenlerIoSession(), app.resumeSenlerIoSession()]);
  assert.equal(first.token, token);
  assert.equal(second.token, token);
  assert.equal(app.calls.length, 2);
  assert.equal(app.useAuthStore.getState().auth, false);
  app.useAuthStore.getState().login(token, 'SENLER_IO');
  assert.equal(JSON.parse(app.localStorage.getItem('senlerIoRefreshSession')).refreshToken, 'next');
  app.finishSenlerIoSessionResume(true);
  assert.equal(app.canResumeSenlerIoSession(), false);
  assert.equal(app.takeSenlerIoLaunchCode(), undefined);
});

test('expired, consumed, malformed or missing launch hints allow fresh OAuth without a code', () => {
  for (const code of [launch(-1), 'malformed', '']) {
    const app = browser({ search: `?launch_code=${code}` });
    assert.equal(app.takeSenlerIoLaunchCode(), undefined);
  }
  const code = launch(110);
  const app = browser({ search: `?launch_code=${code}` });
  assert.equal(app.takeSenlerIoLaunchCode(), code);
  assert.equal(app.takeSenlerIoLaunchCode(), undefined);
});

test('legacy login clears the previous Senler.io refresh credential', () => {
  const app = browser();
  app.useAuthStore.getState().login('ru-jwt', 'SENLER_RU');
  assert.equal(app.localStorage.getItem('senlerIoRefreshSession'), null);
});
