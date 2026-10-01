import "./App.css";
import logo from "./assets/Logo.jpg";
import Header from "./components/Header.jsx";
import CarteEvenement from "./components/CarteEvenement.jsx";
import evenements from "./data/evenements.js";
import { useState } from "react";
import ModalEvenement from "./components/ModalEvenement.jsx";

function App() {
  const [evenementSelectionne, setEvenementSelectionne] = useState(null);

  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);

  const evenementsPasses = evenements.filter((evenement) => {
    if (!evenement.dateISO) {
      return false;
    }

    const date = new Date(evenement.dateISO);

    return date < aujourdHui;
  });

  const evenementsPassesTries = [...evenementsPasses];

  evenementsPassesTries.sort((a, b) => {
    return new Date(b.dateISO) - new Date(a.dateISO);
  });

  const evenementsAVenir = evenements.filter((evenement) => {
    if (!evenement.dateISO) {
      return false;
    }

    const date = new Date(evenement.dateISO);

    return date >= aujourdHui;
  });

  const evenementsAVenirTries = [...evenementsAVenir];

  evenementsAVenirTries.sort((a, b) => {
    return new Date(a.dateISO) - new Date(b.dateISO);
  });

  const evenementADefinir = evenements.find((evenement) => evenement.id === 0);

  return (
    <>
      <Header />
      <main className="accueil">
        <img className="logo" src={logo} alt="Logo de Collector's Club" />
        <h1>Bienvenue sur le site de Collector's Club</h1>
        <p className="description">Notre association de passionnés !</p>
      </main>
      <section className="evenements">
        <h2 className="titre-evenements-a-venir">Événements à venir</h2>
        <div className="liste-evenements liste-evenements-a-venir">
          {evenementsAVenir.length === 0 ? (
            <CarteEvenement
              evenement={evenementADefinir}
              onClick={() => setEvenementSelectionne(evenementADefinir)}
            />
          ) : (
            evenementsAVenirTries.map((evenement) => (
              <CarteEvenement
                key={evenement.id}
                evenement={evenement}
                onClick={() => setEvenementSelectionne(evenement)}
              />
            ))
          )}
        </div>

        <h2 className="titre-evenements-passes">Événements passés</h2>
        <div className="liste-evenements liste-evenements-passes">
          {evenementsPassesTries.map((evenement) => (
            <CarteEvenement
              key={evenement.id}
              evenement={evenement}
              onClick={() => setEvenementSelectionne(evenement)}
            />
          ))}
        </div>
      </section>

      {evenementSelectionne && (
        <ModalEvenement
          evenement={evenementSelectionne}
          onFermer={() => setEvenementSelectionne(null)}
        />
      )}
    </>
  );
}

export default App;
