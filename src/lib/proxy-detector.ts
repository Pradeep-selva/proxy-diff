import type { ChainConfig, ProxyStatus } from "~types"
import { ERC1967_IMPL_SLOT } from "~constants"
import { eth_getCode, eth_getStorageAt, parseAddress } from "~lib/rpc"

export async function detectProxy(
  address: string,
  config: ChainConfig
): Promise<ProxyStatus> {
  const slotValue = await eth_getStorageAt(address, ERC1967_IMPL_SLOT, config.rpcUrl)
  const implAddress = parseAddress(slotValue)
  if (!implAddress) return { isProxy: false }

  const code = await eth_getCode(implAddress, config.rpcUrl)
  if (code === "0x" || code === "0x0") return { isProxy: false }

  return { isProxy: true, currentImpl: implAddress, proxyAddress: address.toLowerCase() }
}
