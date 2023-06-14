export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export function getRandomIntegers(
  from: number,
  to: number,
  { unique = false, count = 1 } = {}
): number[] {
  if (unique && count > to - from + 1) {
    throw new Error("Cannot generate the required amount of unique numbers in the given range.");
  }

  if (unique && count > (to - from + 1) / 2) {
    // only if will need large amount of unique numbers
    // Generate all possible numbers, shuffle the array, then take the amount needed.
    const allNumbers: number[] = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    return shuffleArray(allNumbers).slice(0, count);
  } else {
    const result: number[] = [];
    while (result.length < count) {
      const randomNumber = Math.floor(Math.random() * (to - from + 1)) + from;
      if (unique && result.includes(randomNumber)) {
        continue;
      }
      result.push(randomNumber);
    }
    return result;
  }
}

export function* chain<T>(...iterables: Iterable<T>[]) {
  // Loop through each iterable
  for (let iterable of iterables) {
    // Loop through each value of the iterable
    for (let value of iterable) {
      // Yield the value
      yield value;
    }
  }
}
export async function* asyncChain<T>(...iterables: AsyncIterable<T>[]) {
  for (let iterable of iterables) {
    for await (let value of iterable) {
      yield value;
    }
  }
}
