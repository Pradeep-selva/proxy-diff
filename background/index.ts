import { ETHERSCAN_ADDRESS_PATTERN, ETHERSCAN_HOSTNAME_TO_CHAIN_ID } from "~constants"

export type ActiveContract = { address: string; chainId: number }

const ACTIVE_CONTRACT_KEY = "activeContract"

function parseContractUrl(url: string | undefined): ActiveContract | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const chainId = ETHERSCAN_HOSTNAME_TO_CHAIN_ID[parsed.hostname]
  if (!chainId) return null

  const match = parsed.pathname.match(ETHERSCAN_ADDRESS_PATTERN)
  if (!match) return null

  return { address: match[1].toLowerCase(), chainId }
}

async function syncTab(tabId: number, url: string | undefined): Promise<void> {
  const contract = parseContractUrl(url)
  if (!contract) return

  await chrome.storage.session.set({ [ACTIVE_CONTRACT_KEY]: contract })
  try {
    await chrome.sidePanel.open({ tabId })
  } catch {}
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    void syncTab(tabId, changeInfo.url ?? tab.url)
  }
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return
    void syncTab(tabId, tab.url)
  })
})
