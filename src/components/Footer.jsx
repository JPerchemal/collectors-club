import { FaFacebook, FaInstagram } from "react-icons/fa";

function Footer() {
  const anneeActuelle = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-contenu">
        <div className="footer-infos">
          <p>
            <a
              className="email-association"
              href="mailto:collectorsclub.asso@gmail.com"
            >
              Collector's Club
            </a>
          </p>
          <p>© {anneeActuelle}</p>
          <p>Site conçu et développé par Djekraze</p>
        </div>

        <div className="footer-reseaux">
          <a
            className="lien-facebook"
            href="https://www.facebook.com/profile.php?id=61576309352107"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>
          <span className="instagram-indisponible">
            <FaInstagram />
            <span className="info-instagram">Bientôt disponible</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
