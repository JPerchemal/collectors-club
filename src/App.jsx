import "./App.css";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Accueil from "./pages/Accueil.jsx";
import Evenements from "./pages/Evenements.jsx";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/evenements" element={<Evenements />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
