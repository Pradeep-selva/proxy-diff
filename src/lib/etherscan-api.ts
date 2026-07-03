import type { AbiEntry, AbiFetchResult, ChainConfig } from "~types"
import { UPGRADED_EVENT_TOPIC } from "~constants"
import { parseAddress, type RpcLog } from "~lib/rpc"

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RateLimitError"
  }
}

export class EtherscanApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EtherscanApiError"
  }
}

type EtherscanResponse = { status: string; message: string; result: string | unknown }

const RATE_LIMIT_MESSAGE = "Max rate limit reached"
const UNVERIFIED_MESSAGE = "Contract source code not verified"
const MAX_RETRIES = 3

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function etherscanGet(
  config: ChainConfig,
  params: Record<string, string>,
  apiKey?: string
): Promise<EtherscanResponse> {
  const query = new URLSearchParams(params)
  if (apiKey) query.set("apikey", apiKey)
  const url = `${config.etherscanApiUrl}/api?${query.toString()}`

  let lastError: Error | null = null
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(1000 * 2 ** (attempt - 1))

    let response: Response
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    } catch (err) {
      lastError = new EtherscanApiError(`Network error: ${(err as Error).message}`)
      continue
    }

    if (!response.ok) {
      lastError = new EtherscanApiError(`HTTP ${response.status} from Etherscan`)
      continue
    }

    const json: EtherscanResponse = await response.json()

    if (json.status === "0" && json.result === RATE_LIMIT_MESSAGE) {
      lastError = new RateLimitError(
        "Etherscan rate limit hit. Add an API key in settings for better reliability."
      )
      continue
    }

    return json
  }

  throw lastError ?? new EtherscanApiError("Etherscan request failed")
}

export async function fetchContractABI(
  address: string,
  config: ChainConfig,
  apiKey?: string
): Promise<AbiFetchResult> {
  const json = await etherscanGet(
    config,
    { module: "contract", action: "getabi", address },
    apiKey
  )

  if (json.result === UNVERIFIED_MESSAGE) {
    return { verified: false, address }
  }

  if (json.status !== "1" || typeof json.result !== "string") {
    throw new EtherscanApiError(
      typeof json.result === "string" ? json.result : "Failed to fetch ABI"
    )
  }

  const abi = JSON.parse(json.result) as AbiEntry[]
  return { verified: true, abi }
}

export async function fetchUpgradeEvents(
  proxyAddress: string,
  config: ChainConfig,
  apiKey?: string
): Promise<RpcLog[]> {
  const json = await etherscanGet(
    config,
    {
      module: "logs",
      action: "getLogs",
      address: proxyAddress,
      topic0: UPGRADED_EVENT_TOPIC,
      fromBlock: "0",
      toBlock: "latest",
    },
    apiKey
  )

  if (json.status !== "1") {
    if (Array.isArray(json.result) && json.result.length === 0) return []
    if (json.message === "No records found") return []
    throw new EtherscanApiError(
      typeof json.result === "string" ? json.result : "Failed to fetch upgrade events"
    )
  }

  const logs = json.result as RpcLog[]
  return logs
    .filter((log) => parseAddress(log.topics[1] ?? "") !== null)
    .sort((a, b) => parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16))
}
