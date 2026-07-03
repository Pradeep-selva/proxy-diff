import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { AbiEntry, GetDiffRequest, GetDiffResponse } from "~types"
import { CHAIN_CONFIGS, NOT_A_PROXY_MESSAGE } from "~constants"
import { detectProxy } from "~lib/proxy-detector"
import { resolveImplementationHistory } from "~lib/upgrade-history"
import { fetchBothAbis } from "~lib/abi-fetcher"
import { diffAbis } from "~lib/abi-diff"
import { getApiKey } from "~lib/settings"

const handler: PlasmoMessaging.MessageHandler<
  GetDiffRequest,
  GetDiffResponse
> = async (req, res) => {
  const { proxyAddress, chainId } = req.body ?? {}
  const config = chainId ? CHAIN_CONFIGS[chainId] : undefined

  if (!proxyAddress || !config) {
    res.send({ ok: false, error: "Unsupported network or missing address." })
    return
  }

  try {
    const status = await detectProxy(proxyAddress, config)
    if (!status.isProxy) {
      res.send({ ok: false, error: NOT_A_PROXY_MESSAGE })
      return
    }

    const apiKey = await getApiKey()
    const history = await resolveImplementationHistory(
      proxyAddress,
      status.currentImpl,
      config,
      apiKey
    )

    const { current, previous } = await fetchBothAbis(
      history.currentImpl,
      history.hasPrevious ? history.previousImpl : null,
      config,
      apiKey
    )

    const currentAbi: AbiEntry[] | null = current.verified ? current.abi : null
    const previousAbi: AbiEntry[] | null =
      previous && previous.verified ? previous.abi : null

    const diff = history.hasPrevious ? diffAbis(currentAbi, previousAbi) : null

    res.send({ ok: true, history, diff })
  } catch (err) {
    res.send({ ok: false, error: (err as Error).message })
  }
}

export default handler
