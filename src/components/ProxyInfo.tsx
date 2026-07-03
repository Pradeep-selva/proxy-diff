import { etherscanAddressUrl, truncateAddress } from "~lib/format"

type Impl = { label: string; address: string; verified: boolean }

function ImplRow({ impl, baseUrl }: { impl: Impl; baseUrl: string }) {
  return (
    <div className="pd-impl-row">
      <span className="pd-impl-label">{impl.label}</span>
      <a
        className="pd-impl-addr"
        href={etherscanAddressUrl(baseUrl, impl.address)}
        target="_blank"
        rel="noreferrer">
        {truncateAddress(impl.address)}
      </a>
      {!impl.verified && <span className="pd-badge-warn">unverified</span>}
    </div>
  )
}

function ProxyInfo({
  current,
  previous,
  baseUrl,
}: {
  current: Impl
  previous: Impl | null
  baseUrl: string
}) {
  return (
    <section className="pd-proxyinfo">
      <ImplRow impl={current} baseUrl={baseUrl} />
      {previous && <ImplRow impl={previous} baseUrl={baseUrl} />}
    </section>
  )
}

export default ProxyInfo
