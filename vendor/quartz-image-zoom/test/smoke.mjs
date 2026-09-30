// ponytail: one assert-based check against the built output, no test framework.
// Run with `npm test` (builds first) or `node test/smoke.mjs`.
import assert from "node:assert/strict"
import vm from "node:vm"
import * as mod from "../dist/index.js"
import { ImageZoom } from "../dist/index.js"

// Quartz's config-loader picks the `default` export and classifies the plugin by
// probing the instance. If this drifts, Quartz skips the plugin with only a warning.
assert.equal(typeof mod.default, "function")
assert.ok("htmlPlugins" in mod.default(), "must classify as a transformer")

const img = (properties) => ({ type: "element", tagName: "img", properties, children: [] })

const tree = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [img({ src: "/img/a.png", alt: "A" }), img({ alt: "no src" })],
    },
  ],
}

const transform = ImageZoom().htmlPlugins()[0]()
transform(tree, {})

const [tagged, untouched] = tree.children[0].children

// The img is tagged in place — no wrapper element, so the surrounding markup
// and any layout depending on it are left exactly as authored.
assert.equal(tagged.tagName, "img")
assert.deepEqual(tagged.properties.className, ["lightbox-image"])
assert.equal(tagged.properties.loading, "lazy")
assert.equal(tagged.properties.src, "/img/a.png", "src must be left for CrawlLinks to resolve")

// Must NOT copy src/alt: this runs before CrawlLinks resolves image paths, so a
// copy is stale and the lightbox opens a broken image. The client uses img.src.
assert.equal(tagged.properties["data-src"], undefined)
assert.equal(tagged.properties["data-alt"], undefined)

// An img without a src is left completely alone.
assert.equal(untouched.tagName, "img")
assert.equal(untouched.properties.className, undefined)
assert.equal(untouched.properties.loading, undefined)

// Resources are still shaped the way Quartz expects.
const res = ImageZoom().externalResources()
assert.equal(res.css[0].inline, true)
assert.match(res.css[0].content, /\.lightbox-image/)
assert.equal(res.js[0].contentType, "inline")
assert.equal(res.js[0].loadTime, "afterDOMReady")

// Regressions we have already paid for once, asserted so they cannot come back:
const { content: css } = res.css[0]
const { script } = res.js[0]
assert.doesNotMatch(css, /backdrop-filter\s*:/, "full-viewport blur stutters in Chrome")
assert.doesNotMatch(css, /border-radius:\s*8px/, "image zoom must preserve the theme's image corners")
assert.match(
  css,
  /dialog\.lightbox\[open\]\s*\{[^}]*display:/,
  "display must be set on [open] only",
)
assert.match(script, /__lightboxReady/, "must guard against rebinding on SPA nav")
assert.match(
  script,
  /await img\.decode\(\)/,
  "must decode before showModal to avoid a blank overlay",
)
assert.match(script, /dialog\.isConnected/, "must discard dialogs detached by SPA navigation")
assert.match(
  script,
  /addEventListener\('prenav', resetDialog\)/,
  "must close before SPA body replacement",
)
assert.ok(
  script.indexOf("d.showModal()") <
    script.indexOf("style.overflow = 'hidden'", script.indexOf("d.showModal()")),
  "must only lock scrolling after showModal succeeds",
)
assert.doesNotMatch(script, /addEventListener\('keydown'/, "Esc is the dialog's job, not ours")

// Simulate a Quartz SPA body replacement. The second click must create a new,
// connected dialog instead of reusing the detached one and locking page scroll.
const documentListeners = new Map()
const dialogs = []
const documentElement = { style: { overflow: "" } }

function createElement(tagName) {
  const listeners = new Map()
  const element = {
    tagName,
    className: "",
    alt: "",
    src: "",
    open: false,
    isConnected: false,
    children: [],
    setAttribute() {},
    addEventListener(type, listener) {
      listeners.set(type, listener)
    },
    append(...children) {
      this.children.push(...children)
    },
    querySelector(selector) {
      return selector === "img" ? this.children.find((child) => child.tagName === "img") : null
    },
    async decode() {},
    showModal() {
      if (!this.isConnected) throw new Error("dialog is detached")
      this.open = true
    },
    close() {
      this.open = false
      listeners.get("close")?.()
    },
  }
  if (tagName === "dialog") dialogs.push(element)
  return element
}

const fakeDocument = {
  documentElement,
  body: {
    appendChild(element) {
      element.isConnected = true
    },
  },
  createElement,
  addEventListener(type, listener) {
    const list = documentListeners.get(type) ?? []
    list.push(listener)
    documentListeners.set(type, list)
  },
}

async function dispatch(type, event = {}) {
  await Promise.all((documentListeners.get(type) ?? []).map((listener) => listener(event)))
}

vm.runInNewContext(script, { window: {}, document: fakeDocument })
const thumb = {
  currentSrc: "https://example.com/image.png",
  src: "https://example.com/image.png",
  alt: "Example",
  closest(selector) {
    return selector === "img.lightbox-image" ? this : null
  },
}

await dispatch("click", { target: thumb })
assert.equal(dialogs.length, 1)
assert.equal(dialogs[0].open, true)
assert.equal(documentElement.style.overflow, "hidden")

await dispatch("prenav")
dialogs[0].isConnected = false
await dispatch("nav")
assert.equal(documentElement.style.overflow, "")

await dispatch("click", { target: thumb })
assert.equal(dialogs.length, 2, "must replace a dialog detached by SPA navigation")
assert.equal(dialogs[1].open, true)
assert.equal(documentElement.style.overflow, "hidden")

console.log("ok — smoke tests passed")
