import { env } from "~/env.mjs";
import { getBaseUrl } from "./helpers";

export async function revalidatePathAPI(paths: string[]) {
  try {
    const endpoint = new URL(`${getBaseUrl()}/api/revalidate`);

    endpoint.searchParams.append("paths", paths.join(","));
    endpoint.searchParams.append("secret", env.REVALIDATION_TOKEN);

    await fetch(endpoint.href);
  } catch (err) {
    console.error(err);

    return null;
  }
}
