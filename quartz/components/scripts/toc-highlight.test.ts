import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

const bundledComponent = readFileSync(
  new URL("../../../vendor/table-of-contents/dist/components/index.js", import.meta.url),
  "utf8",
)

test("TOC only highlights headings intersecting the viewport", () => {
  assert.match(bundledComponent, /e\.isIntersecting\?o\.forEach/)
  assert.doesNotMatch(bundledComponent, /e\.boundingClientRect\.y<s\?o\.forEach/)
})
