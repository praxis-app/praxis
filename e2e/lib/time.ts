export function minutesUntil(isoTimestamp: string) {
  return Math.round((new Date(isoTimestamp).getTime() - Date.now()) / 60_000);
}

export function secondsUntil(isoTimestamp: string) {
  return Math.round((new Date(isoTimestamp).getTime() - Date.now()) / 1000);
}
