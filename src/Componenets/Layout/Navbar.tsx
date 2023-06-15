import { Link, useNavigate } from "react-router-dom";
import useTitle from "~/hooks/useTitle";

import "./Navbar.scss";
import { useState } from "react";
import useIsMobile from "~/hooks/useIsMobile";
import useCurrentPageRoute from "~/hooks/useCurrentPageRoute";
import useUser from "~/hooks/useUser";
import { auth } from "~/firebase/config";

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
      <Link to="/">
        <img
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
  const currentRoute = useCurrentPageRoute();
  const { user, isAdmin } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
              to="/"
              onClick={hideMobileMenu}
              className={`nav-links ${currentRoute === "/" ? "active-page" : ""}`}
            >
              <i className="fa fa-plane nav-icons"></i>
              שחק
            </Link>
          </li>
          <li className="nav-items">
            <Link
              to="/add-question"
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
              to="/records"
              className={`nav-links ${currentRoute === "/records" ? "active-page" : ""}`}
            >
              <i className="fa fa-line-chart nav-icons"></i>
              שיאים
            </Link>
          </li>
          <li className="nav-items">
            <Link
              onClick={hideMobileMenu}
              to="/about"
              className={`nav-links ${currentRoute === "/about" ? "active-page" : ""}`}
            >
              <i className="fa fa-beer nav-icons"></i>
              אודות
            </Link>
          </li>
          {user && isAdmin && (
            <>
              <li className="nav-items">
                <button
                  className="nav-links"
                  onClick={() => {
                    hideMobileMenu();
                    navigate("/admin");
                  }}
                >
                  Admin
                </button>
              </li>
              <li className="nav-items">
                <button
                  className="nav-links"
                  onClick={() => {
                    hideMobileMenu();
                    auth.signOut().then(() => window.location.replace("/"));
                  }}
                >
                  התנתק
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
