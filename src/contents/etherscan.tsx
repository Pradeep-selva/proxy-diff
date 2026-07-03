import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo"

import type { CheckProxyResponse } from "~types"
import { ETHERSCAN_ADDRESS_PATTERN, ETHERSCAN_HOSTNAME_TO_CHAIN_ID } from "~constants"

export const config: PlasmoCSConfig = {
  matches: ["https://etherscan.io/address/*", "https://*.etherscan.io/address/*"],
}

const BUTTON_ID = "proxydiff-btn"

type ButtonState = "idle" | "checking" | "is-proxy" | "not-proxy" | "error"

const LABELS: Record<ButtonState, string> = {
  idle: "🔍 View Upgrade Diff",
  checking: "Checking…",
  "is-proxy": "✓ Proxy — open panel",
  "not-proxy": "Not an upgradeable proxy",
  error: "Error — retry",
}

function currentContract(): { address: string; chainId: number } | null {
  const chainId = ETHERSCAN_HOSTNAME_TO_CHAIN_ID[window.location.hostname]
  if (!chainId) return null
  const match = window.location.pathname.match(ETHERSCAN_ADDRESS_PATTERN)
  if (!match) return null
  return { address: match[1].toLowerCase(), chainId }
}

function setState(button: HTMLButtonElement, state: ButtonState): void {
  button.dataset.state = state
  button.textContent = LABELS[state]
  button.disabled = state === "checking"
}

async function onClick(button: HTMLButtonElement): Promise<void> {
  const contract = currentContract()
  if (!contract) return

  setState(button, "checking")
  try {
    const status = await sendToBackground<
      { address: string; chainId: number },
      CheckProxyResponse
    >({ name: "check-proxy", body: contract })

    if (status.isProxy) {
      setState(button, "is-proxy")
      await chrome.runtime.sendMessage({ name: "open-panel" }).catch(() => {})
    } else {
      setState(button, "not-proxy")
    }
  } catch {
    setState(button, "error")
  }
}

function createButton(): HTMLButtonElement {
  const button = document.createElement("button")
  button.id = BUTTON_ID
  button.type = "button"
  button.style.cssText = [
    "margin-left:8px",
    "padding:4px 10px",
    "font-size:12px",
    "font-weight:600",
    "border:1px solid #2172e5",
    "border-radius:6px",
    "background:#2172e5",
    "color:#fff",
    "cursor:pointer",
  ].join(";")
  setState(button, "idle")
  button.addEventListener("click", () => void onClick(button))
  return button
}

function findAnchor(): Element | null {
  return (
    document.querySelector("#mainaddress") ??
    document.querySelector("h1") ??
    document.querySelector(".card-header")
  )
}

function inject(): void {
  if (!currentContract()) return
  if (document.getElementById(BUTTON_ID)) return
  const anchor = findAnchor()
  if (!anchor) return
  anchor.appendChild(createButton())
}

function waitForDom(): void {
  inject()
  if (document.getElementById(BUTTON_ID)) return

  const observer = new MutationObserver(() => {
    inject()
    if (document.getElementById(BUTTON_ID)) observer.disconnect()
  })
  observer.observe(document.body, { childList: true, subtree: true })
  setTimeout(() => observer.disconnect(), 5000)
}

let lastPath = window.location.pathname
function onNavigate(): void {
  if (window.location.pathname === lastPath) return
  lastPath = window.location.pathname
  document.getElementById(BUTTON_ID)?.remove()
  waitForDom()
}

waitForDom()
window.addEventListener("popstate", onNavigate)
setInterval(onNavigate, 1000)
