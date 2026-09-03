/** Shortens an address to its first and last characters. */
export function truncate(address: string, chars = 4) {
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}
