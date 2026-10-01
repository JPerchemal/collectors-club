import { useEffect, useRef } from "react";

function ModalEvenement({ evenement, onFermer }) {
  const boutonFermerRef = useRef(null);
  const elementPrecedentRef = useRef(null);

  useEffect(() => {
    elementPrecedentRef.current = document.activeElement;

    boutonFermerRef.current.focus();

    return () => {
      elementPrecedentRef.current.focus();
    };
  }, []);

  useEffect(() => {
    const gererTouche = (event) => {
      if (event.key === "Escape") {
        onFermer();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        boutonFermerRef.current.focus();
      }
    };

    window.addEventListener("keydown", gererTouche);

    return () => {
      window.removeEventListener("keydown", gererTouche);
    };
  }, [onFermer]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onFermer}>
      <div
        className="modal-evenement"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={boutonFermerRef}
          className="fermer-modal"
          onClick={onFermer}
          aria-label="Fermer la fenêtre"
        >
          ×
        </button>
        <img
          className="affiche-modal"
          src={evenement.affiche}
          alt={`Affiche de ${evenement.titre}`}
        />
        <h2>{evenement.titre}</h2>

        <p className="infos-evenement">
          {evenement.date} • {evenement.heure} • {evenement.lieu}
        </p>

        <p>{evenement.description}</p>
      </div>
    </div>
  );
}

export default ModalEvenement;
