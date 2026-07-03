import { useCallback, useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import "../style.css"

import type { GetDiffRequest, GetDiffResponse } from "~types"
import { CHAIN_CONFIGS, NOT_A_PROXY_MESSAGE } from "~constants"
import Header from "~components/Header"
import ProxyInfo from "~components/ProxyInfo"
import DiffSummary from "~components/DiffSummary"
import DiffSection from "~components/DiffSection"
import LoadingState from "~components/LoadingState"
import ErrorState from "~components/ErrorState"
import EmptyState from "~components/EmptyState"

type ActiveContract = { address: string; chainId: number }
type Status = "idle" | "loading" | "loaded" | "error"

const ACTIVE_CONTRACT_KEY = "activeContract"

function SidePanel() {
  const [contract, setContract] = useState<ActiveContract | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [response, setResponse] = useState<GetDiffResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const load = useCallback(async (active: ActiveContract) => {
    setStatus("loading")
    setResponse(null)
    try {
      const res = await sendToBackground<GetDiffRequest, GetDiffResponse>({
        name: "get-diff",
        body: { proxyAddress: active.address, chainId: active.chainId },
      })
      setResponse(res)
      setStatus("loaded")
    } catch (err) {
      setErrorMessage((err as Error).message)
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    chrome.storage.session.get(ACTIVE_CONTRACT_KEY).then((store) => {
      const active = store[ACTIVE_CONTRACT_KEY] as ActiveContract | undefined
      if (active) {
        setContract(active)
        void load(active)
      }
    })

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area !== "session" || !changes[ACTIVE_CONTRACT_KEY]) return
      const active = changes[ACTIVE_CONTRACT_KEY].newValue as ActiveContract | undefined
      if (active) {
        setContract(active)
        void load(active)
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [load])

  if (!contract) {
    return (
      <div className="pd-root">
        <div className="pd-state">
          <div className="pd-state-icon">🔎</div>
          <p className="pd-state-title">ProxDiff</p>
          <p className="pd-state-sub">
            Open a contract on Etherscan to inspect its proxy upgrade history.
          </p>
        </div>
      </div>
    )
  }

  const baseUrl = CHAIN_CONFIGS[contract.chainId]?.etherscanBaseUrl ?? ""

  return (
    <div className="pd-root">
      <Header address={contract.address} baseUrl={baseUrl} />
      {status === "loading" && <LoadingState />}
      {status === "error" && (
        <ErrorState message={errorMessage} onRetry={() => void load(contract)} />
      )}
      {status === "loaded" && response && (
        <Result response={response} baseUrl={baseUrl} onRetry={() => void load(contract)} />
      )}
    </div>
  )
}

function Result({
  response,
  baseUrl,
  onRetry,
}: {
  response: GetDiffResponse
  baseUrl: string
  onRetry: () => void
}) {
  if (!response.ok) {
    if (response.error === NOT_A_PROXY_MESSAGE) return <EmptyState variant="not_proxy" />
    return <ErrorState message={response.error} onRetry={onRetry} />
  }

  const { history, diff } = response

  if (!history.hasPrevious) {
    return (
      <>
        <ProxyInfo
          current={{ label: "Current", address: history.currentImpl, verified: true }}
          previous={null}
          baseUrl={baseUrl}
        />
        <EmptyState variant={history.reason} />
      </>
    )
  }

  return (
    <>
      <ProxyInfo
        current={{
          label: "Current",
          address: history.currentImpl,
          verified: diff?.currentImplVerified ?? true,
        }}
        previous={{
          label: "Previous",
          address: history.previousImpl,
          verified: diff?.previousImplVerified ?? true,
        }}
        baseUrl={baseUrl}
      />
      {diff && diff.currentImplVerified ? (
        <>
          <DiffSummary diff={diff} />
          <DiffSection title="Functions" section={diff.functions} />
          <DiffSection title="Events" section={diff.events} />
          <DiffSection title="Errors" section={diff.errors} />
        </>
      ) : (
        <p className="pd-nochanges">
          Current implementation is unverified on Etherscan — diff unavailable.
        </p>
      )}
    </>
  )
}

export default SidePanel
