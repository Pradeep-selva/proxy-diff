import type { ChainConfig } from "~types"

export const ERC1967_IMPL_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"

// keccak256("Upgraded(address)")
export const UPGRADED_EVENT_TOPIC =
  "0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b"

export const CHAIN_CONFIGS: Record<number, ChainConfig> = {
  1: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://cloudflare-eth.com",
    etherscanApiUrl: "https://api.etherscan.io",
    etherscanBaseUrl: "https://etherscan.io",
  },
  11155111: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: "https://rpc.ankr.com/eth_sepolia",
    etherscanApiUrl: "https://api-sepolia.etherscan.io",
    etherscanBaseUrl: "https://sepolia.etherscan.io",
  },
}

export const NOT_A_PROXY_MESSAGE = "This contract is not an upgradeable proxy."

export const ETHERSCAN_ADDRESS_PATTERN = /\/address\/(0x[0-9a-fA-F]{40})/i

export const ETHERSCAN_HOSTNAME_TO_CHAIN_ID: Record<string, number> = {
  "etherscan.io": 1,
  "sepolia.etherscan.io": 11155111,
}
