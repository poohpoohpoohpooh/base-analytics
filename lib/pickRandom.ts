export function pickRandom<T>(items: readonly T[], previous?: T | null): T | null {
  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return items[0];
  }

  const candidates = previous ? items.filter((item) => item !== previous) : items;
  const pool = candidates.length > 0 ? candidates : items;

  return pool[Math.floor(Math.random() * pool.length)];
}
