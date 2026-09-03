/** Shortens an address to its first and last characters. */
export function truncate(address: string, chars = 4) {
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** Renders a token amount with a fixed number of decimal places. */
export function formatUnitsFixed(value: bigint, decimals: number, dp: number) {
  const base = 10n ** BigInt(decimals);
  const whole = (value / base).toLocaleString("en-US");
  if (dp === 0) return whole;
  const frac = (value % base).toString().padStart(decimals, "0").slice(0, dp);
  return `${whole}.${frac}`;
}
