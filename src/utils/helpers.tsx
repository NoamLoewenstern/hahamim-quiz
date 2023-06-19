export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function shuffleArray<T>(array: T[]): T[] {
  if (array.length < 2) return array;
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // Swap
    [array[currentIndex], array[randomIndex]] = [array[randomIndex] as T, array[currentIndex] as T];
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

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};
