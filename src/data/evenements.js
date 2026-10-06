import evenement08 from "../assets/Evenement08.jpg";
import evenement07 from "../assets/Evenement07.jpg";
import evenement06 from "../assets/Evenement06.jpg";
import evenement05 from "../assets/Evenement05.jpg";
import evenement04 from "../assets/Evenement04.jpg";
import evenement03 from "../assets/Evenement03.jpg";
import evenement02 from "../assets/Evenement02.jpg";
import evenement01 from "../assets/Evenement01.jpg";
import assembleeGenerale01 from "../assets/AssembleeGenerale01.jpg";
import rencontreMultiJeux01 from "../assets/RencontreMultiJeux01.jpg";
import prochainEvenementADefinir from "../assets/ProchainEvenementADefinir.jpg";

const evenements = [
  {
    id: 0,
    titre: "A définir",
    date: "A définir",
    heure: "A définir",
    lieu: "A définir",
    affiche: prochainEvenementADefinir,
    description: "A définir",
  },
  {
    id: 8,
    titre: "Ciné Club",
    date: "25 septembre 2026",
    dateISO: "2026-09-25T00:00:00",
    heure: "21 h",
    lieu: "Sub Culture",
    affiche: evenement08,
    description:
      "Projection d'un film dans notre boutique partenaire SubCulture.",
  },
  {
    id: 7,
    titre: "Ciné Club",
    date: "28 août 2026",
    dateISO: "2026-08-28T00:00:00",
    heure: "21 h",
    lieu: "Sub Culture",
    affiche: evenement07,
    description:
      "Projection d'un film dans notre boutique partenaire SubCulture.",
  },
  {
    id: 101,
    titre: "Assemblée générale",
    date: "14 août 2026",
    dateISO: "2026-08-14T00:00:00",
    heure: "A partir de 19h30",
    lieu: "Sub Culture",
    affiche: assembleeGenerale01,
    description:
      "Assemblée Générale du Collector's Club dans notre boutique partenaire SubCulture de notre Souverain et Guide suprême.",
  },
  {
    id: 6,
    titre: "Ciné Club",
    date: "31 juillet 2026",
    dateISO: "2026-07-31T00:00:00",
    heure: "21 h",
    lieu: "Sub Culture",
    affiche: evenement06,
    description:
      "Projection d'un film dans notre boutique partenaire SubCulture.",
  },
  {
    id: 5,
    titre: "Ciné Club",
    date: "26 juin 2026",
    dateISO: "2026-06-26T00:00:00",
    heure: "21 h",
    lieu: "Médiathèque, salle Laurentine Teillet",
    affiche: evenement05,
    description: "Projection d'un film à la médiathèque de Saint Junien.",
  },
  {
    id: 4,
    titre: "Ciné Club",
    date: "29 mai 2026",
    dateISO: "2026-05-29T00:00:00",
    heure: "21 h",
    lieu: "Sub Culture",
    affiche: evenement04,
    description:
      "Projection d'un film dans notre boutique partenaire SubCulture.",
  },
  {
    id: 3,
    titre: "Ciné Club",
    date: "24 avril 2026",
    dateISO: "2026-04-24T00:00:00",
    heure: "21 h",
    lieu: "Médiathèque, salle Laurentine Teillet",
    affiche: evenement03,
    description: "Projection d'un film à la médiathèque de Saint Junien.",
  },
  {
    id: 2,
    titre: "Ciné Club",
    date: "27 mars 2026",
    dateISO: "2026-03-27T00:00:00",
    heure: "21 h",
    lieu: "Médiathèque, salle Laurentine Teillet",
    affiche: evenement02,
    description: "Projection d'un film à la médiathèque de Saint Junien.",
  },
  {
    id: 1,
    titre: "Ciné Club",
    date: "27 février 2026",
    dateISO: "2026-02-27T00:00:00",
    heure: "21 h",
    lieu: "Médiathèque, salle Laurentine Teillet",
    affiche: evenement01,
    description: "Projection d'un film à la médiathèque de Saint Junien.",
  },
  {
    id: 201,
    titre: "Rencontre Multi-Jeux",
    date: "8 novembre 2025",
    dateISO: "2025-11-08T00:00:00",
    heure: "de 10h à 19h",
    lieu: "Salle des fêtes de Saint Junien",
    affiche: rencontreMultiJeux01,
    description:
      "Rencontre Multi-Jeux à la salle des fêtes de Saint Junien. Jeux Vidéo, jeux de société, jeux de rôle et TCG.",
  },
];

export default evenements;
