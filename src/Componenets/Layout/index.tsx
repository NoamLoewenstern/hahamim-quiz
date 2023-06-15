import "../styles/App.scss";
import "../styles/Mobile.scss";
import "./Layout.scss";
import Navbar from "./Navbar";
import { useGlobalLoadingSpinner } from "~/hooks/useLoadingSpinner";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { LoadingSpinnerModal } = useGlobalLoadingSpinner();
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <LoadingSpinnerModal />
    </>
  );
}
