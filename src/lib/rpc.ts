export class RpcError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RpcError"
  }
}

export type RpcLog = {
  blockNumber: string
  logIndex: string
  transactionHash: string
  topics: string[]
  data: string
}

type RpcResponse<T> = { result: T; error?: undefined } | { result?: undefined; error: { message: string } }

async function rpcCall<T>(rpcUrl: string, method: string, params: unknown[]): Promise<T> {
  let response: Response
  try {
    response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch (err) {
    throw new RpcError(`Network error calling ${method}: ${(err as Error).message}`)
  }

  if (!response.ok) {
    throw new RpcError(`HTTP ${response.status} from RPC calling ${method}`)
  }

  const json: RpcResponse<T> = await response.json()

  if (json.error) {
    throw new RpcError(`RPC error in ${method}: ${json.error.message}`)
  }

  return json.result as T
}

export async function eth_getStorageAt(
  address: string,
  slot: string,
  rpcUrl: string
): Promise<string> {
  return rpcCall<string>(rpcUrl, "eth_getStorageAt", [address, slot, "latest"])
}

export async function eth_getCode(address: string, rpcUrl: string): Promise<string> {
  return rpcCall<string>(rpcUrl, "eth_getCode", [address, "latest"])
}

export async function eth_getLogs(
  params: { address: string; topics: string[]; fromBlock: string; toBlock: string },
  rpcUrl: string
): Promise<RpcLog[]> {
  return rpcCall<RpcLog[]>(rpcUrl, "eth_getLogs", [
    {
      address: params.address,
      topics: params.topics,
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
    },
  ])
}

export function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value)
}

export function normalizeAddress(value: string): string {
  return value.toLowerCase()
}

export function parseAddress(hexValue: string): string | null {
  const hex = hexValue.startsWith("0x") ? hexValue.slice(2) : hexValue
  if (hex.length < 40) return null
  const address = "0x" + hex.slice(-40).toLowerCase()
  if (address === "0x" + "0".repeat(40)) return null
  if (!/^0x[0-9a-f]{40}$/.test(address)) return null
  return address
}

export function hexToNumber(hex: string): number {
  return parseInt(hex, 16)
}
