import type { AbiDiff } from "~types"

function countBy(diff: AbiDiff, key: "added" | "removed" | "unchanged"): number {
  return diff.functions[key].length + diff.events[key].length + diff.errors[key].length
}

function DiffSummary({ diff }: { diff: AbiDiff }) {
  if (!diff.hasChanges) {
    return <p className="pd-nochanges">No interface changes between implementations.</p>
  }

  return (
    <div className="pd-summary">
      <span className="pd-pill pd-pill-added">+{countBy(diff, "added")} added</span>
      <span className="pd-pill pd-pill-removed">−{countBy(diff, "removed")} removed</span>
      <span className="pd-pill pd-pill-unchanged">
        {countBy(diff, "unchanged")} unchanged
      </span>
    </div>
  )
}

export default DiffSummary
