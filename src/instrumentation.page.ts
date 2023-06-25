export async function register() {
  const { cache } = await import("./setupCache");
  await cache.questions.initHydrate();
}
