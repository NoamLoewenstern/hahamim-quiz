import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Navigate({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.push(to);
  }, []);
  return <></>;
}
