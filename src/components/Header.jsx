import titre from "../assets/CollectorSClub.jpg";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <img className="titre-header" src={titre} alt="Collector's Club" />

        <nav className="navigation">
          <Link to="/">Accueil</Link>
          <Link to="/evenements">Événements</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
