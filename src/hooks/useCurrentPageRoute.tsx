import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function useCurrentPageRoute() {
  const { pathname } = useLocation();
  const currentPage = useMemo(() => {
    const currentPage = pathname.split("/")[1];
    return currentPage;
  }, [pathname]);

  return `/${currentPage}`;
}
