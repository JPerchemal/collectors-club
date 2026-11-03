import { db } from "./database.js";
import evenements from "../src/data/evenements.js";

console.log("Nombre d'événements :", evenements.length);

const evenementsAImporter = evenements.filter((evenement) => {
  return evenement.id !== 0;
});

console.log("Événements à importer :", evenementsAImporter.length);

const insererEvenement = db.prepare(`
  INSERT INTO EVENEMENT (titre, affiche, description)
  VALUES (?, ?, ?)
`);

const insererSeance = db.prepare(`
  INSERT INTO SEANCE (date, heureDebut, heureFin, lieu, idEvenement)
  VALUES (?, ?, ?, ?, ?)
`);

function convertirHoraires(heure) {
  const heuresTrouvees = heure.match(/\d{1,2}h/g);

  if (heuresTrouvees && heuresTrouvees.length === 2) {
    return {
      heureDebut: heuresTrouvees[0].replace("h", ":00"),
      heureFin: heuresTrouvees[1].replace("h", ":00"),
    };
  }

  const resultatHeure = heure.match(/(\d{1,2})h(\d{2})/);

  if (resultatHeure) {
    const heures = resultatHeure[1];
    const minutes = resultatHeure[2];

    return {
      heureDebut: `${heures}:${minutes}`,
      heureFin: null,
    };
  }

  const heureConvertie = heure.replace(" h", ":00");

  return {
    heureDebut: heureConvertie,
    heureFin: null,
  };
}

const nombreEvenements = db
  .prepare(
    `
  SELECT COUNT(*) AS total FROM EVENEMENT
`,
  )
  .get();

const nombreSeances = db
  .prepare(
    `
  SELECT COUNT(*) AS total FROM SEANCE
`,
  )
  .get();

if (nombreEvenements.total > 0 || nombreSeances.total > 0) {
  console.error(
    "Importation annulée : la base contient déjà des événements ou des séances.",
  );
  process.exit(1);
}

try {
  db.exec("BEGIN TRANSACTION");

  console.log("Transaction démarrée");

  evenementsAImporter.forEach((evenement) => {
    // 1. Récupérer les informations de l'événement
    const titre = evenement.titre;
    const affiche = evenement.affiche;
    const description = evenement.description;

    // 2. Insérer l'événement dans SQLite
    const resultatInsertion = insererEvenement.run(titre, affiche, description);

    // 3. Récupérer l'identifiant créé
    const idEvenement = resultatInsertion.lastInsertRowid;

    // 4. Préparer les informations de la séance
    const date = evenement.dateISO.split("T")[0];
    const horaires = convertirHoraires(evenement.heure);
    const lieu = evenement.lieu;

    // 5. Insérer la séance associée
    insererSeance.run(
      date,
      horaires.heureDebut,
      horaires.heureFin,
      lieu,
      idEvenement,
    );

    console.log("Événement et séance insérés :", idEvenement);
  });

  db.exec("COMMIT");

  console.log("Transaction validée");
} catch (erreur) {
  if (db.isTransaction) {
    db.exec("ROLLBACK");
  }

  console.error("Erreur pendant l'importation :", erreur);

  process.exitCode = 1;
}
