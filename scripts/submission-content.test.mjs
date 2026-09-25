import assert from "node:assert/strict";
import { build } from "esbuild";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { getSubmissionLink, getSubmissionPreviewText } from "../src/pages/(list_integration)/creativetasks/submissionContent.utils.ts";

for (const value of ["javascript:alert(1)", "data:text/html,hello", "file:///etc/passwd", "//example.com", "not a link"]) assert.equal(getSubmissionLink(value), null);
assert.equal(getSubmissionLink(" https://example.com/page "), "https://example.com/page");
assert.equal(getSubmissionLink("http://example.com"), "http://example.com/");
assert.equal(getSubmissionPreviewText({ items: [{ texts: ["Материалы без публикации"] }] }), "Материалы без публикации");

const { outputFiles } = await build({
  entryPoints: ["src/pages/(list_integration)/creativetasks/components/SubmissionContentPreview.tsx"],
  bundle: true, write: false, format: "esm", platform: "node", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
const { SubmissionContentPreview } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`);
const markup = renderToStaticMarkup(createElement(SubmissionContentPreview, { submission: {
  items: [{ texts: ["Материалы без публикации", "<script>unsafe</script>"], targetUrls: ["https://example.com", "javascript:alert(1)"], mediaFileIds: ["media-id"] }, { texts: ["Вторая публикация"], publicationUrl: "https://example.com/post", erid: "test-erid" }],
  comment: "Комментарий исполнителя",
} }));
for (const text of ["Материалы без публикации", "Вторая публикация", "Комментарий исполнителя", "media-id", "test-erid", "Просмотр пока недоступен"]) assert.ok(markup.includes(text));
assert.ok(markup.includes('href="https://example.com/"'));
assert.ok(!markup.includes('href="javascript:'));
assert.ok(!markup.includes("<script>"));
assert.ok(!markup.includes("<img"), "An opaque file ID must not become a fabricated image URL");
console.log("Submission content: all items, unpublished materials, comments, unavailable media and safe links passed.");
