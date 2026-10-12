import { useEffect, useState } from "react";

function ModalInscription({ onFermer }) {
  const [email, setEmail] = useState("");

  const [inscriptionConfirmee, setInscriptionConfirmee] = useState(false);

  const [erreurInscription, setErreurInscription] = useState("");

  const gererSoumission = (event) => {
    event.preventDefault();
    setErreurInscription("");
    setInscriptionConfirmee(true);
  };

  useEffect(() => {
    const gererTouche = (event) => {
      if (event.key === "Escape") {
        onFermer();
      }
    };

    window.addEventListener("keydown", gererTouche);

    return () => {
      window.removeEventListener("keydown", gererTouche);
    };
  }, [onFermer]);

  useEffect(() => {
    const ancienOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = ancienOverflow;
    };
  }, []);

  return (
    <div className="modal-inscription-overlay" onClick={onFermer}>
      <div
        className="modal-inscription"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Rester informé</h2>
        <p>Recevez un e-mail lorsqu'un nouvel événement est publié.</p>
        {!inscriptionConfirmee && (
          <form onSubmit={gererSoumission}>
            <label htmlFor="email-inscription">Votre adresse e-mail</label>

            <input
              type="email"
              id="email-inscription"
              name="email"
              placeholder="exemple@domaine.fr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
            <button type="submit" className="bouton-inscription">
              S'inscrire
            </button>
          </form>
        )}
        {inscriptionConfirmee && (
          <p className="message-confirmation" role="status">
            Simulation : votre demande d'inscription pour{" "}
            <strong>{email}</strong> a été prise en compte.
          </p>
        )}
        {erreurInscription && (
          <p className="message-erreur" role="alert">
            {erreurInscription}
          </p>
        )}
        <button className="bouton-fermer-inscription" onClick={onFermer}>
          Fermer
        </button>
      </div>
    </div>
  );
}

export default ModalInscription;
