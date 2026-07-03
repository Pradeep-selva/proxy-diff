import type { DiffEntry as DiffEntryType } from "~types"
import { displaySignature } from "~lib/format"

const PREFIX: Record<DiffEntryType["status"], string> = {
  added: "+",
  removed: "−",
  unchanged: " ",
}

function DiffEntry({ entry }: { entry: DiffEntryType }) {
  return (
    <div className={`pd-entry pd-entry-${entry.status}`}>
      <span className="pd-entry-prefix">{PREFIX[entry.status]}</span>
      <code className="pd-entry-sig">{displaySignature(entry.entry)}</code>
    </div>
  )
}

export default DiffEntry
