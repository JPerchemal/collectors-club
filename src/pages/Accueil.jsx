import logo from "../assets/Logo.jpg";

function Accueil() {
  return (
    <main className="accueil">
      <img className="logo" src={logo} alt="Logo de Collector's Club" />
      <h1>Bienvenue sur le site de Collector's Club</h1>
      <p className="description">Notre association de passionnés !</p>
    </main>
  );
}

export default Accueil;
