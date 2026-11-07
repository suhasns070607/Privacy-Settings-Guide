const browserIdKey = 'review-rhythm-browser-id';

export function getBrowserId(): string {
  const existingId = localStorage.getItem(browserIdKey);
  if (existingId) return existingId;

  const newId = crypto.randomUUID();
  localStorage.setItem(browserIdKey, newId);
  return newId;
}
