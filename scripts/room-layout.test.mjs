import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// Render the actual parent with query states; no test framework or backend requests.
const state = {};
const require = createRequire(import.meta.url);
const modules = {
  "react-router-dom": { useParams: () => ({ slug: "room" }), Outlet: () => React.createElement("div", null, "EDITOR_CHECKPOINT") },
  "@/hooks/rooms/useGetRoomById": { useGetRoomById: () => state.room },
  "@/hooks/projects/useGetProject": { useGetProject: () => state.project },
  "@components/Loader": { Loader: () => React.createElement("div", null, "LOADING") },
  "../(list_integration)": { RoomBox: ({ children }) => React.createElement("main", null, children) },
};
const compiled = ts.transpileModule(readFileSync(new URL("../src/pages/modules/RoomLayout.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const exports = {};
runInNewContext(compiled, {
  exports,
  require: (name) => modules[name] ?? require(name),
});
const render = () => renderToStaticMarkup(React.createElement(exports.RoomLayout));
const error = new Error("Offline");

state.room = { room: { id: "room" }, isError: false, isLoading: false };
state.project = { project: { id: "project" }, isError: false, isLoading: false };
assert.match(render(), /EDITOR_CHECKPOINT/);

// Background refresh failures must keep the editor and its retry checkpoint mounted.
state.room = { ...state.room, isError: true, error };
state.project = { ...state.project, isError: true, error };
assert.match(render(), /EDITOR_CHECKPOINT/);

// Initial mandatory-data failure is still a blocking error, never an empty editor.
state.room = { room: undefined, isError: true, isLoading: false, error };
assert.match(render(), /Ошибка загрузки компании/);
assert.doesNotMatch(render(), /EDITOR_CHECKPOINT/);

state.room = { room: { id: "room" }, isError: false, isLoading: false };
state.project = { project: undefined, isError: true, isLoading: false, error };
assert.match(render(), /Ошибка загрузки проекта/);
assert.doesNotMatch(render(), /EDITOR_CHECKPOINT/);

state.project = { project: undefined, isError: false, isLoading: true };
assert.match(render(), /LOADING/);
console.log("Room layout: cached-data errors preserve the editor; initial essential errors still block.");
