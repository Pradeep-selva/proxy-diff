export type AbiParameterType = {
  name: string
  type: string
  components?: AbiParameterType[]
  internalType?: string
}

export type AbiFunctionEntry = {
  type: "function"
  name: string
  inputs: AbiParameterType[]
  outputs: AbiParameterType[]
  stateMutability: string
}

export type AbiEventEntry = {
  type: "event"
  name: string
  inputs: (AbiParameterType & { indexed: boolean })[]
  anonymous: boolean
}

export type AbiErrorEntry = {
  type: "error"
  name: string
  inputs: AbiParameterType[]
}

export type AbiConstructorEntry = {
  type: "constructor"
  inputs: AbiParameterType[]
  stateMutability: string
}

export type AbiFallbackEntry = {
  type: "fallback" | "receive"
  stateMutability: string
}

export type AbiEntry =
  | AbiFunctionEntry
  | AbiEventEntry
  | AbiErrorEntry
  | AbiConstructorEntry
  | AbiFallbackEntry

export type ProxyStatus =
  | { isProxy: false }
  | { isProxy: true; currentImpl: string; proxyAddress: string }

export type ImplementationHistory =
  | { hasPrevious: false; currentImpl: string; reason: "no_events" | "single_upgrade" }
  | { hasPrevious: true; currentImpl: string; previousImpl: string }

export type AbiFetchResult =
  | { verified: true; abi: AbiEntry[] }
  | { verified: false; address: string }

export type DiffStatus = "added" | "removed" | "unchanged"

export type DiffEntry = {
  signature: string
  status: DiffStatus
  entry: AbiEntry
}

export type AbiDiffSection = {
  added: DiffEntry[]
  removed: DiffEntry[]
  unchanged: DiffEntry[]
}

export type AbiDiff = {
  functions: AbiDiffSection
  events: AbiDiffSection
  errors: AbiDiffSection
  hasChanges: boolean
  currentImplVerified: boolean
  previousImplVerified: boolean
}

export type CheckProxyRequest = { address: string; chainId: number }
export type CheckProxyResponse = ProxyStatus

export type GetDiffRequest = { proxyAddress: string; chainId: number }
export type GetDiffResponse =
  | { ok: true; history: ImplementationHistory; diff: AbiDiff | null }
  | { ok: false; error: string }

export type ChainConfig = {
  chainId: number
  name: string
  rpcUrl: string
  etherscanApiUrl: string
  etherscanBaseUrl: string
}
