const API_KEY_STORAGE_KEY = "etherscanApiKey"

export async function getApiKey(): Promise<string | undefined> {
  const store = await chrome.storage.local.get(API_KEY_STORAGE_KEY)
  const key = store[API_KEY_STORAGE_KEY]
  return typeof key === "string" && key.length > 0 ? key : undefined
}

export async function setApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [API_KEY_STORAGE_KEY]: key })
}
