export function swap<T>(array: T[], i: number, j: number): void {
  i < 0 && (i = array.length - i);
  j < 0 && (j = array.length - j);

  const tmp = array[i];
  array[i] = array[j];
  array[j] = tmp;
}

export function arrayToRecord<T, K extends PropertyKey, V>(array: T[], mapper: Mapper<T, K, V>) {
  return array.reduce((acc, element, index) => {
    const [key, value] = mapper(element, index);
    acc[key] = value;
    return acc;
  }, {} as Record<K, V>);
}

export function arrayToMap<T, K extends PropertyKey, V>(array: T[], mapper: Mapper<T, K, V>) {
  return array.reduce((acc, element, index) => {
    const [key, value] = mapper(element, index);
    return acc.set(key, value);
  }, new Map<K, V>());
}

type Mapper<T, K, V> = (element: T, index: number) => [K, V];