import titre from "../assets/CollectorSClub.jpg";
import { Link } from "react-router-dom";
import { useState } from "react";
import ModalInscription from "./ModalInscription.jsx";

function Header() {
  const [modalOuverte, setModalOuverte] = useState(false);
  return (
    <header className="header">
      <div className="header-content">
        <img className="titre-header" src={titre} alt="Collector's Club" />

        <nav className="navigation">
          <Link to="/">Accueil</Link>
          <Link to="/evenements">Événements</Link>
          <button
            className="bouton-inscription"
            onClick={() => setModalOuverte(true)}
          >
            Être informé
          </button>
        </nav>
        {modalOuverte && (
          <ModalInscription onFermer={() => setModalOuverte(false)} />
        )}
      </div>
    </header>
  );
}

export default Header;
