function CarteEvenement({ evenement, onClick }) {
  return (
    <button className="carte-evenement" onClick={onClick}>
      <img
        className="affiche-evenement"
        src={evenement.affiche}
        alt={`Affiche de ${evenement.titre}`}
      />
      <h3>{evenement.titre}</h3>
      <p className="infos-evenement">
        {evenement.date} • {evenement.heure} • {evenement.lieu}
      </p>
      <p>{evenement.description}</p>
    </button>
  );
}

export default CarteEvenement;
