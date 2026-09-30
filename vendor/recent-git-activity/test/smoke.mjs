import assert from "node:assert/strict"
import render from "preact-render-to-string"
import RecentGitActivity, { readRecentCommits } from "../src/index.js"

const commits = readRecentCommits(3)
assert.ok(commits.length > 0, "expected Git commits from the Quartz repository")
assert.ok(commits.length <= 3)
assert.match(commits[0].shortHash, /^[0-9a-f]+$/)
assert.ok(commits[0].subject)

const Component = RecentGitActivity({ title: "最近修改", limit: 3 })
const html = render(Component({ displayClass: "desktop-only" }))
assert.match(html, /recent-git-activity/)
assert.match(html, /最近修改/)
assert.match(html, new RegExp(commits[0].shortHash))
assert.match(html, /github\.com\/zhugeshi\/zhugeshi\.github\.io\/commit\//)
assert.match(Component.css, /\.git-hash/)

console.log("ok — recent Git activity smoke tests passed")
