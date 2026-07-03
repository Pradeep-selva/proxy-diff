export async function getCached<T>(key: string): Promise<T | undefined> {
  const store = await chrome.storage.session.get(key)
  return store[key] as T | undefined
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  await chrome.storage.session.set({ [key]: value })
}
