import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { CheckProxyRequest, CheckProxyResponse } from "~types"
import { CHAIN_CONFIGS } from "~constants"
import { detectProxy } from "~lib/proxy-detector"
import { getCached, setCached } from "~lib/cache"
import { isAddress, normalizeAddress } from "~lib/rpc"

const handler: PlasmoMessaging.MessageHandler<
  CheckProxyRequest,
  CheckProxyResponse
> = async (req, res) => {
  const { address, chainId } = req.body ?? {}
  const config = chainId ? CHAIN_CONFIGS[chainId] : undefined

  if (!address || !isAddress(address) || !config) {
    res.send({ isProxy: false })
    return
  }

  const normalized = normalizeAddress(address)
  const cacheKey = `proxy:${chainId}:${normalized}`
  const cached = await getCached<CheckProxyResponse>(cacheKey)
  if (cached) {
    res.send(cached)
    return
  }

  try {
    const status = await detectProxy(normalized, config)
    await setCached(cacheKey, status)
    res.send(status)
  } catch {
    res.send({ isProxy: false })
  }
}

export default handler
