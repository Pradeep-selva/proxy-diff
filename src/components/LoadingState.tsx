import { useEffect, useState } from "react"

const STEPS = [
  "Reading implementation slot…",
  "Fetching upgrade history…",
  "Loading ABIs…",
  "Computing diff…",
]

function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="pd-state">
      <div className="pd-spinner" />
      <p className="pd-state-title">Analyzing proxy…</p>
      <p className="pd-state-sub">{STEPS[step]}</p>
    </div>
  )
}

export default LoadingState
