#!/usr/bin/env node
import { copyFileSync, readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const artifactDir = process.env.TOC_ROLLBACK_ARTIFACT_DIR ?? dirname(fileURLToPath(import.meta.url))
const target = resolve(
  process.argv[2] ?? join(artifactDir, "..", "..", "vendor", "table-of-contents", "dist", "components", "index.js"),
)
const expected = "C77788612D0848B24AA581112F85F2B815BB13AAB9F19A1A89A7AA8D5AA21C00"

copyFileSync(join(artifactDir, "ORIGINAL_FILE.js"), target)
const actual = createHash("sha256").update(readFileSync(target)).digest("hex").toUpperCase()
if (actual !== expected) throw new Error(`Rollback hash mismatch: ${actual}`)

console.log(
  `ROLLBACK_OK target=${target} sha256=${actual} restored_branch=boundingClientRect.y<rootBounds.height`,
)
