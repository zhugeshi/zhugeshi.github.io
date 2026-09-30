import { execFileSync } from "node:child_process"
import { h } from "preact"

const defaultOptions = {
  title: "最近修改",
  limit: 5,
}

const styles = `
.recent-git-activity > h3 {
  margin: 0.5rem 0 0;
  font-size: 1rem;
}

.recent-git-activity > ul {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
}

.recent-git-activity > ul > li {
  margin: 0 0 0.85rem;
  line-height: 1.35;
}

.recent-git-activity .git-message {
  color: var(--darkgray);
  font-size: 0.9rem;
  text-decoration: none;
}

.recent-git-activity .git-message:hover {
  color: var(--secondary);
}

.recent-git-activity .git-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
  color: var(--gray);
  font-size: 0.75rem;
}

.recent-git-activity .git-hash {
  padding: 0.05rem 0.3rem;
  border-radius: 0.2rem;
  background: var(--highlight);
  color: var(--secondary);
  font-family: var(--codeFont);
}

.recent-git-activity .git-empty {
  margin: 0.75rem 0 0;
  color: var(--gray);
  font-size: 0.85rem;
}
`

function runGit(args) {
  return execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim()
}

function repositoryUrl() {
  try {
    const remote = runGit(["config", "--get", "remote.origin.url"])
    if (!remote) return undefined

    const sshMatch = remote.match(/^git@([^:]+):(.+)$/)
    const normalized = sshMatch ? `https://${sshMatch[1]}/${sshMatch[2]}` : remote
    return normalized.replace(/^ssh:\/\/git@/, "https://").replace(/\.git$/, "")
  } catch {
    return undefined
  }
}

function relativeTime(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp * 1000) / 1000))
  if (seconds < 60) return "刚刚"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)} 天前`
  if (seconds < 86400 * 365) return `${Math.floor(seconds / (86400 * 30))} 个月前`
  return `${Math.floor(seconds / (86400 * 365))} 年前`
}

export function readRecentCommits(limit) {
  try {
    const output = runGit(["log", `-${limit}`, "--pretty=format:%H%x1f%h%x1f%at%x1f%s%x1e"])
    if (!output) return []

    const baseUrl = repositoryUrl()
    return output
      .split("\x1e")
      .map((record) => record.trim())
      .filter(Boolean)
      .map((record) => {
        const [hash, shortHash, timestamp, ...subjectParts] = record.split("\x1f")
        const unixTime = Number(timestamp)
        return {
          hash,
          shortHash,
          timestamp: unixTime,
          subject: subjectParts.join("\x1f"),
          url: baseUrl ? `${baseUrl}/commit/${hash}` : undefined,
        }
      })
      .filter((commit) => commit.hash && commit.shortHash && Number.isFinite(commit.timestamp))
  } catch {
    return []
  }
}

export const RecentGitActivity = (userOptions = {}) => {
  const options = { ...defaultOptions, ...userOptions }
  const limit = Math.min(20, Math.max(1, Math.trunc(Number(options.limit) || 5)))
  const commits = readRecentCommits(limit)

  const Component = ({ displayClass }) =>
    h(
      "section",
      { class: ["recent-git-activity", displayClass].filter(Boolean).join(" ") },
      h("h3", null, options.title),
      commits.length === 0
        ? h("p", { class: "git-empty" }, "暂无 Git 修改记录")
        : h(
            "ul",
            null,
            commits.map((commit) => {
              const message = commit.url
                ? h(
                    "a",
                    {
                      class: "git-message",
                      href: commit.url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                    commit.subject,
                  )
                : h("span", { class: "git-message" }, commit.subject)

              return h(
                "li",
                { key: commit.hash },
                message,
                h(
                  "div",
                  { class: "git-meta" },
                  h("code", { class: "git-hash" }, commit.shortHash),
                  h(
                    "time",
                    {
                      dateTime: new Date(commit.timestamp * 1000).toISOString(),
                      title: new Date(commit.timestamp * 1000).toLocaleString("zh-CN"),
                    },
                    relativeTime(commit.timestamp),
                  ),
                ),
              )
            }),
          ),
    )

  Component.css = styles
  return Component
}

export default RecentGitActivity
