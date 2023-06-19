import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function useCurrentPageRoute() {
  const pathname = usePathname();
  const currentPage = useMemo(() => {
    const currentPage = pathname?.split("/")[1] || "/";
    return currentPage;
  }, [pathname]);

  return `/${currentPage}`;
}
