export type EmptyVariant = "not_proxy" | "no_events" | "single_upgrade"

const MESSAGES: Record<EmptyVariant, { title: string; sub: string }> = {
  not_proxy: {
    title: "Not an upgradeable proxy",
    sub: "This contract does not expose an ERC-1967 implementation slot.",
  },
  no_events: {
    title: "No upgrade history",
    sub: "Proxy detected, but no Upgraded events were found. The implementation may have been set without emitting one.",
  },
  single_upgrade: {
    title: "Only one implementation",
    sub: "This proxy has only ever pointed at a single implementation. There is no previous version to compare.",
  },
}

function EmptyState({ variant }: { variant: EmptyVariant }) {
  const { title, sub } = MESSAGES[variant]
  return (
    <div className="pd-state">
      <div className="pd-state-icon">🔍</div>
      <p className="pd-state-title">{title}</p>
      <p className="pd-state-sub">{sub}</p>
    </div>
  )
}

export default EmptyState
