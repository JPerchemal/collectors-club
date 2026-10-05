import logo from "../assets/Logo.jpg";
import BlocAssociation from "../components/BlocAssociation.jsx";
import blocsAssociation from "../data/blocsAssociation.js";

function Accueil() {
  return (
    <main className="accueil">
      <img className="logo" src={logo} alt="Logo de Collector's Club" />
      <h1>Bienvenue sur le site de Collector's Club</h1>
      <p className="description">Notre association de passionnés !</p>
      <section className="presentation-association">
        <h2>L'association</h2>
        <p>
          Le Collector's Club est une association basée à Saint-Junien, qui
          rassemble des passionnés autour de la culture, du cinéma, des jeux et
          de l'univers de la collection.
        </p>
        <p>
          Notre objectif est simple : créer des moments conviviaux et
          accessibles à tous, permettant de se rencontrer, de partager ses
          passions et de découvrir de nouveaux univers.
        </p>
        <div className="liste-blocs-association">
          {blocsAssociation.map((bloc) => (
            <BlocAssociation key={bloc.id} bloc={bloc} />
          ))}
        </div>
      </section>
      <section className="rejoindre-association">
        <h2>Rejoindre le Collector's Club</h2>
        <p>
          Vous aimez le cinéma, les jeux, les collections ou la culture
          populaire ? Vous souhaitez participer à nos événements, rencontrer
          d'autres passionnés ou simplement découvrir l'association ?
        </p>
        <p className="appel-rejoindre">Rejoignez-nous !</p>
        <p className="cotisation">
          Cotisation annuelle : <strong>15 €</strong>
        </p>
      </section>
    </main>
  );
}

export default Accueil;
