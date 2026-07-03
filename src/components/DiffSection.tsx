import { useState } from "react"

import type { AbiDiffSection } from "~types"
import DiffEntry from "~components/DiffEntry"

function DiffSection({ title, section }: { title: string; section: AbiDiffSection }) {
  const entries = [...section.added, ...section.removed, ...section.unchanged]
  const [open, setOpen] = useState(true)

  if (entries.length === 0) return null

  return (
    <section className="pd-section">
      <button
        type="button"
        className="pd-section-header"
        onClick={() => setOpen((o) => !o)}>
        <span className="pd-section-caret">{open ? "▾" : "▸"}</span>
        {title} ({entries.length})
      </button>
      {open && (
        <div className="pd-section-body">
          {entries.map((entry) => (
            <DiffEntry key={`${entry.status}:${entry.signature}`} entry={entry} />
          ))}
        </div>
      )}
    </section>
  )
}

export default DiffSection
