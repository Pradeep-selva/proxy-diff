import type { AbiEntry } from "~types"

export function truncateAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function etherscanAddressUrl(baseUrl: string, address: string): string {
  return `${baseUrl}/address/${address}`
}

function paramTypes(inputs: { type: string }[]): string {
  return inputs.map((p) => p.type).join(",")
}

export function displaySignature(entry: AbiEntry): string {
  if (entry.type === "function") {
    const inputs = paramTypes(entry.inputs)
    const outputs = entry.outputs.length ? paramTypes(entry.outputs) : "void"
    return `${entry.name}(${inputs}) → ${outputs}`
  }
  if (entry.type === "event") {
    return `event ${entry.name}(${paramTypes(entry.inputs)})`
  }
  if (entry.type === "error") {
    return `error ${entry.name}(${paramTypes(entry.inputs)})`
  }
  return entry.type
}
