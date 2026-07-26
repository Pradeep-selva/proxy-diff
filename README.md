# ProxDiff

A Chrome extension that augments blockchain explorer contract pages. When you open
an upgradeable proxy on Etherscan, ProxDiff detects it, resolves the current and
previous implementations from the ERC-1967 slot and `Upgraded` events, and shows the
ABI diff (added / removed / unchanged functions, events, and errors) in a side panel.

Supported in V1: ERC-1967 implementation proxies (Transparent, UUPS, standard slot)
on Ethereum mainnet.

## Prerequisites

- Node 20+ (the toolchain does not run on the repo's default Node 14)
- [pnpm](https://pnpm.io)

## Development

```sh
pnpm install
pnpm dev
```

Then load the unpacked extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select `build/chrome-mv3-dev`

Open any `https://etherscan.io/address/<contract>` page — ProxDiff injects a
**View Upgrade Diff** button and opens the side panel for detected proxies.

## Production build

```sh
pnpm build      # minified output in build/chrome-mv3-prod
pnpm package    # zips build/chrome-mv3-prod.zip for the Chrome Web Store
```

## Etherscan API key

The extension works without a key using public rate-limited endpoints. For better
reliability, add a free [Etherscan API key](https://etherscan.io/apis) via the
extension's **Options** page. The key is stored in `chrome.storage.local` and is
never bundled into the build.

## Project layout

All Plasmo entry points live under `src/` (Plasmo treats `src/` as its source root
whenever it exists):

- `src/background/` — service worker: tab tracking + `check-proxy` / `get-diff` message handlers
- `src/contents/etherscan.tsx` — content script that injects the button
- `src/sidepanel/` — side panel UI
- `src/options.tsx` — settings page
- `src/lib/` — RPC client, Etherscan API, proxy detection, upgrade history, ABI diff
- `src/components/` — side panel React components
