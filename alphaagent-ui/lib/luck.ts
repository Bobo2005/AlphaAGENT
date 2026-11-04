// Chance of at least k wins in n picks if every game were a fair coin flip.
export function coinFlipTail(n: number, k: number): number {
  const c: number[] = [];
  let v = 1;
  for (let i = 0; i <= n; i++) { c.push(v); v = (v * (n - i)) / (i + 1); }
  let sum = 0;
  for (let i = k; i <= n; i++) sum += c[i];
  return sum / Math.pow(2, n);
}
export const oneIn = (p: number) => Math.max(1, Math.round(1 / p));
