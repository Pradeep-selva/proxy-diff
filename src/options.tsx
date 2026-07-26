import { useEffect, useState } from "react"

import "./style.css"

import { getApiKey, setApiKey } from "~lib/settings"

function Options() {
  const [key, setKey] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getApiKey().then((stored) => setKey(stored ?? ""))
  }, [])

  const onSave = async () => {
    await setApiKey(key.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="pd-root pd-options">
      <h1 className="pd-options-title">ProxDiff Settings</h1>

      <label className="pd-options-label" htmlFor="pd-apikey">
        Etherscan API key
      </label>
      <input
        id="pd-apikey"
        className="pd-input"
        type="text"
        value={key}
        placeholder="Optional — improves rate limits"
        onChange={(e) => {
          setKey(e.target.value)
          setSaved(false)
        }}
      />
      <p className="pd-options-hint">
        {key.length} characters. Without a key, requests use public rate-limited
        endpoints. Get a free key at{" "}
        <a
          href="https://etherscan.io/apis"
          target="_blank"
          rel="noreferrer"
          className="pd-header-addr">
          etherscan.io/apis
        </a>
        .
      </p>

      <button type="button" className="pd-btn" onClick={() => void onSave()}>
        {saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  )
}

export default Options
