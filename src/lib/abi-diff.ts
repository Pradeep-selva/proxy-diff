import type {
  AbiDiff,
  AbiDiffSection,
  AbiEntry,
  AbiParameterType,
  DiffEntry,
} from "~types"

function canonicalType(param: AbiParameterType): string {
  if (param.components && param.type.startsWith("tuple")) {
    const inner = param.components.map(canonicalType).join(",")
    return param.type.replace("tuple", `(${inner})`)
  }
  return param.type
}

function signature(entry: AbiEntry): string {
  if (entry.type === "function" || entry.type === "event" || entry.type === "error") {
    const types = entry.inputs.map(canonicalType).join(",")
    return `${entry.name}(${types})`
  }
  return entry.type
}

function diffAbiSection(current: AbiEntry[], previous: AbiEntry[]): AbiDiffSection {
  const currentMap = new Map(current.map((e) => [signature(e), e]))
  const previousMap = new Map(previous.map((e) => [signature(e), e]))

  const added: DiffEntry[] = []
  const unchanged: DiffEntry[] = []
  const removed: DiffEntry[] = []

  for (const [sig, entry] of currentMap) {
    if (previousMap.has(sig)) unchanged.push({ signature: sig, status: "unchanged", entry })
    else added.push({ signature: sig, status: "added", entry })
  }
  for (const [sig, entry] of previousMap) {
    if (!currentMap.has(sig)) removed.push({ signature: sig, status: "removed", entry })
  }

  return { added, unchanged, removed }
}

function byType<T extends AbiEntry["type"]>(
  abi: AbiEntry[],
  type: T
): Extract<AbiEntry, { type: T }>[] {
  return abi.filter((e) => e.type === type) as Extract<AbiEntry, { type: T }>[]
}

export function diffAbis(
  currentAbi: AbiEntry[] | null,
  previousAbi: AbiEntry[] | null
): AbiDiff {
  const current = currentAbi ?? []
  const previous = previousAbi ?? []

  const functions = diffAbiSection(byType(current, "function"), byType(previous, "function"))
  const events = diffAbiSection(byType(current, "event"), byType(previous, "event"))
  const errors = diffAbiSection(byType(current, "error"), byType(previous, "error"))

  const hasChanges =
    functions.added.length + functions.removed.length +
      events.added.length + events.removed.length +
      errors.added.length + errors.removed.length >
    0

  return {
    functions,
    events,
    errors,
    hasChanges,
    currentImplVerified: currentAbi !== null,
    previousImplVerified: previousAbi !== null,
  }
}
