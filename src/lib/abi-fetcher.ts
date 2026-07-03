import type { AbiEntry, AbiFetchResult, AbiParameterType, ChainConfig } from "~types"
import { fetchContractABI } from "~lib/etherscan-api"

function normalizeParam(param: AbiParameterType): AbiParameterType {
  const normalized: AbiParameterType = { name: param.name, type: param.type }
  if (param.components) normalized.components = param.components.map(normalizeParam)
  if ("indexed" in param) {
    ;(normalized as AbiParameterType & { indexed: boolean }).indexed = (
      param as AbiParameterType & { indexed: boolean }
    ).indexed
  }
  return normalized
}

function normalizeEntry(entry: AbiEntry): AbiEntry {
  if (entry.type === "function") {
    return {
      type: "function",
      name: entry.name,
      inputs: entry.inputs.map(normalizeParam),
      outputs: entry.outputs.map(normalizeParam),
      stateMutability: entry.stateMutability,
    }
  }
  if (entry.type === "event") {
    return {
      type: "event",
      name: entry.name,
      inputs: entry.inputs.map(normalizeParam) as (AbiParameterType & { indexed: boolean })[],
      anonymous: entry.anonymous,
    }
  }
  if (entry.type === "error") {
    return { type: "error", name: entry.name, inputs: entry.inputs.map(normalizeParam) }
  }
  return entry
}

export function normalizeAbi(abi: AbiEntry[]): AbiEntry[] {
  return abi.map(normalizeEntry)
}

async function fetchOne(
  address: string,
  config: ChainConfig,
  apiKey?: string
): Promise<AbiFetchResult> {
  const result = await fetchContractABI(address, config, apiKey)
  if (result.verified) return { verified: true, abi: normalizeAbi(result.abi) }
  return result
}

export async function fetchBothAbis(
  currentImpl: string,
  previousImpl: string | null,
  config: ChainConfig,
  apiKey?: string
): Promise<{ current: AbiFetchResult; previous: AbiFetchResult | null }> {
  const [currentResult, previousResult] = await Promise.allSettled([
    fetchOne(currentImpl, config, apiKey),
    previousImpl ? fetchOne(previousImpl, config, apiKey) : Promise.resolve(null),
  ])

  if (currentResult.status === "rejected") throw currentResult.reason

  const previous =
    previousResult.status === "fulfilled"
      ? previousResult.value
      : previousImpl
        ? { verified: false as const, address: previousImpl }
        : null

  return { current: currentResult.value, previous }
}
