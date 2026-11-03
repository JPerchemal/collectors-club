import { useState, useEffect } from "react";
import evenements from "../data/evenements.js";
import CarteEvenement from "../components/CarteEvenement.jsx";
import ModalEvenement from "../components/ModalEvenement.jsx";

function Evenements() {
  const [evenementSelectionne, setEvenementSelectionne] = useState(null);

  const [evenementsAPI, setEvenementsAPI] = useState([]); // Conserver les éléments reçus du serveur
  const [chargement, setChargement] = useState(true); //Indique si la requête est encore en cours
  const [erreur, setErreur] = useState(""); //Conserver un éventuel message d'erreur

  useEffect(() => {
    async function chargerEvenements() {
      try {
        const reponse = await fetch("http://localhost:3000/seances");
        const donnees = await reponse.json();

        const evenementsTransformes = donnees.map((evenement) => {
          return {
            ...evenement,
            dateISO: evenement.date,
            date: new Date(evenement.date + "T12:00:00").toLocaleDateString(
              "fr-FR",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            ),
            heure: evenement.heureDebut.replace(":", " h "),
          };
        });

        setEvenementsAPI(evenementsTransformes);
        console.log("Événements transformés :", evenementsTransformes);
      } catch (erreurRecue) {
        console.log("Impossible de récupérer les événements :", erreurRecue);
        setErreur("Serveur indisponible");
      } finally {
        setChargement(false);
      }
    }

    chargerEvenements();
  }, []);

  console.log("Chargement en cours :", chargement);
  console.log("Message d'erreur :", erreur);

  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);

  const evenementsAPIAVenir = evenementsAPI.filter((evenement) => {
    const date = new Date(evenement.dateISO + "T00:00:00");

    return date >= aujourdHui;
  });

  const evenementsAPIAVenirTries = [...evenementsAPIAVenir];

  evenementsAPIAVenirTries.sort((a, b) => {
    return new Date(a.dateISO) - new Date(b.dateISO);
  });

  const evenementsAPIPasses = evenementsAPI.filter((evenement) => {
    const date = new Date(evenement.dateISO + "T00:00:00");

    return date < aujourdHui;
  });

  const evenementsAPIPassesTries = [...evenementsAPIPasses];

  evenementsAPIPassesTries.sort((a, b) => {
    return new Date(b.dateISO) - new Date(a.dateISO);
  });

  const evenementADefinir = evenements.find((evenement) => evenement.id === 0);

  return (
    <main>
      {chargement && <p>Chargement des événements...</p>}
      {erreur && <p>{erreur}</p>}

      <section className="evenements">
        <h2 className="titre-evenements-a-venir">Événements à venir</h2>

        <div className="liste-evenements liste-evenements-a-venir">
          {evenementsAPIAVenirTries.length === 0 ? (
            <CarteEvenement
              evenement={evenementADefinir}
              onClick={() => setEvenementSelectionne(evenementADefinir)}
            />
          ) : (
            evenementsAPIAVenirTries.map((evenement) => (
              <CarteEvenement
                key={evenement.idSeance}
                evenement={evenement}
                onClick={() => setEvenementSelectionne(evenement)}
              />
            ))
          )}
        </div>
        <h2 className="titre-evenements-passes">Événements passés</h2>

        <div className="liste-evenements liste-evenements-passes">
          {evenementsAPIPassesTries.map((evenement) => (
            <CarteEvenement
              key={evenement.idSeance}
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
    </main>
  );
}

export default Evenements;
