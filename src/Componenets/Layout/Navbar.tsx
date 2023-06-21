import useTitle from "~/hooks/useTitle";
import { signIn, signOut } from "next-auth/react";
import { isMobile } from "react-device-detect";

import { useState } from "react";
import useCurrentPageRoute from "~/hooks/useCurrentPageRoute";
import useUser from "~/hooks/useUser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

function Header() {
  const { title, subtitle } = useTitle();

  return (
    <header>
      <h1>{title}</h1>
      <h2 className="nav-head">{subtitle}</h2>
    </header>
  );
}
function Logo() {
  return (
    <div className="logo-container">
      <Link href="/">
        <Image
          src="images/white.png"
          style={{ backgroundColor: "transparent" }}
          className="nav-logo-image"
          alt=""
        />
      </Link>
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const currentRoute = useCurrentPageRoute();
  const { user, isAdmin, isLoadingUser } = useUser();

  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuActive((isActive) => !isActive);
  };
  const hideMobileMenu = () => {
    setIsMobileMenuActive(false);
  };

  return (
    <nav className="nav">
      <Logo />
      <Header />
      <div className="nav-container">
        {isMobile && (
          <div
            id="mobile-menu-hamburger-btn"
            className={`${isMobileMenuActive ? "is-active" : ""}`}
            onClick={toggleMobileMenu}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        )}

        <ul
          className={`nav-menu ${isMobile && isMobileMenuActive ? "mobile-active" : ""}`}
          id="nav-menu"
        >
          <li className="nav-items">
            <Link
              href="/"
              onClick={hideMobileMenu}
              className={`nav-links ${currentRoute === "/" ? "active-page" : ""}`}
            >
              <i className="fa fa-plane nav-icons"></i>
              שחק
            </Link>
          </li>
          <li className="nav-items">
            <Link
              href="/add-question"
              onClick={hideMobileMenu}
              className={`nav-links ${currentRoute === "/add-question" ? "active-page" : ""}`}
            >
              <i className="fa fa-plus nav-icons"></i>
              הוסף שאלה
            </Link>
          </li>
          <li className="nav-items">
            <Link
              onClick={hideMobileMenu}
              href="/records"
              className={`nav-links ${currentRoute === "/records" ? "active-page" : ""}`}
            >
              <i className="fa fa-line-chart nav-icons"></i>
              שיאים
            </Link>
          </li>
          <li className="nav-items">
            <Link
              onClick={hideMobileMenu}
              href="/about"
              className={`nav-links ${currentRoute === "/about" ? "active-page" : ""}`}
            >
              <i className="fa fa-beer nav-icons"></i>
              אודות
            </Link>
          </li>
          {isAdmin && (
            <li className="nav-items">
              <button
                className="nav-links"
                onClick={() => {
                  hideMobileMenu();
                  router.replace("/admin");
                }}
              >
                Admin
              </button>
            </li>
          )}
          {!isLoadingUser && user && (
            <li className="nav-items">
              <button
                className="nav-links"
                onClick={() => {
                  hideMobileMenu();
                  void signOut()
                    .then(() => window.location.reload())
                    .catch();
                }}
              >
                התנתק
              </button>
            </li>
          )}
          {!isLoadingUser && !user && (
            <li className="nav-items">
              <button
                className="nav-links"
                onClick={() => {
                  hideMobileMenu();
                  signIn().catch(() => {
                    router.push("/api/auth/signin");
                  });
                }}
              >
                התחבר
              </button>
            </li>
          )}
          {isLoadingUser && <li className="nav-items"></li>}
        </ul>
      </div>
    </nav>
  );
}
