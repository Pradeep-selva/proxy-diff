import { etherscanAddressUrl, truncateAddress } from "~lib/format"

function Header({ address, baseUrl }: { address: string; baseUrl: string }) {
  return (
    <header className="pd-header">
      <span className="pd-logo">ProxDiff</span>
      <a
        className="pd-header-addr"
        href={etherscanAddressUrl(baseUrl, address)}
        target="_blank"
        rel="noreferrer">
        {truncateAddress(address)}
      </a>
    </header>
  )
}

export default Header
