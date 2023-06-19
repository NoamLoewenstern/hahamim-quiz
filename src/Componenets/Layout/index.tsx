import Navbar from "./Navbar";
import { useGlobalLoadingSpinner } from "~/hooks/useLoadingSpinner";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { LoadingSpinnerModal } = useGlobalLoadingSpinner();
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <LoadingSpinnerModal />
    </>
  );
}
