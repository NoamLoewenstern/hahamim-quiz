import { Outlet } from "react-router-dom";
import "../styles/App.scss";
import "../styles/Mobile.scss";
import "./Layout.scss";
import Navbar from "./Navbar";
import { useGlobalLoadingSpinner } from "~/hooks/useLoadingSpinner";
import Footer from "./Footer";
import { useSignInAnonymously } from "~/hooks/useUser";

export default function Layout() {
  const { LoadingSpinnerModal } = useGlobalLoadingSpinner();
  useSignInAnonymously();
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <LoadingSpinnerModal />
    </>
  );
}
