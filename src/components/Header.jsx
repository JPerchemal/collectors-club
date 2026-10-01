import titre from "../assets/CollectorSClub.jpg";

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <img className="titre-header" src={titre} alt="Collector's Club" />

        <nav className="navigation">
          <a href="#">Accueil</a>
          <a href="#">Événements</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
