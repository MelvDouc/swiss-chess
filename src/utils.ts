import type Pairing from "$/Pairing.ts";
import type PairingData from "$/PairingData.ts";
import type { PlayerId } from "$/Player.ts";

export function createTable<T, K extends PropertyKey, V>(
  array: T[],
  mapper: (element: T) => [K, V]
) {
  return array.reduce((acc, element) => {
    const [key, value] = mapper(element);
    acc[key] = value;
    return acc;
  }, {} as Record<K, V>);
}

export function backtrackPairings(
  sortedData: PairingData[],
  paired: Set<PlayerId>,
  round: Pairing[],
  i: number
) {
  while (i < sortedData.length && paired.has(sortedData[i].playerId))
    i++;

  if (i >= sortedData.length)
    return true;

  const a = sortedData[i];

  for (let j = i + 1; j < sortedData.length; j++) {
    const b = sortedData[j];
    if (paired.has(b.playerId)) continue;

    const pairing = a.getPairingWith(b);
    if (!pairing) continue;

    paired.add(a.playerId).add(b.playerId);
    round.push(pairing);

    if (backtrackPairings(sortedData, paired, round, i + 1))
      return true;

    paired.delete(a.playerId);
    paired.delete(b.playerId);
    round.pop();
  }

  return false;
}