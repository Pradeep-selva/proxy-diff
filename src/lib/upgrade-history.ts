import type { ChainConfig, ImplementationHistory } from "~types"
import { UPGRADED_EVENT_TOPIC } from "~constants"
import { eth_getLogs, parseAddress, type RpcLog } from "~lib/rpc"
import { fetchUpgradeEvents } from "~lib/etherscan-api"

async function fetchLogs(
  proxyAddress: string,
  config: ChainConfig,
  apiKey?: string
): Promise<RpcLog[]> {
  try {
    return await eth_getLogs(
      {
        address: proxyAddress,
        topics: [UPGRADED_EVENT_TOPIC],
        fromBlock: "0x0",
        toBlock: "latest",
      },
      config.rpcUrl
    )
  } catch {
    return fetchUpgradeEvents(proxyAddress, config, apiKey)
  }
}

export async function resolveImplementationHistory(
  proxyAddress: string,
  currentImpl: string,
  config: ChainConfig,
  apiKey?: string
): Promise<ImplementationHistory> {
  const logs = await fetchLogs(proxyAddress, config, apiKey)

  const sorted = [...logs].sort((a, b) => {
    const blockDiff = parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16)
    if (blockDiff !== 0) return blockDiff
    return parseInt(a.logIndex, 16) - parseInt(b.logIndex, 16)
  })

  const impls: string[] = []
  for (const log of sorted) {
    const impl = parseAddress(log.topics[1] ?? "")
    if (impl && impl !== impls[impls.length - 1]) impls.push(impl)
  }

  if (impls.length === 0) return { hasPrevious: false, currentImpl, reason: "no_events" }

  const previousImpl = [...impls].reverse().find((impl) => impl !== currentImpl)
  if (!previousImpl) return { hasPrevious: false, currentImpl, reason: "single_upgrade" }

  return { hasPrevious: true, currentImpl, previousImpl }
}
