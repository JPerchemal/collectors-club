import { db } from "./database.js";

const verificationEvenements = db
  .prepare(
    `
  SELECT COUNT(*) AS total FROM EVENEMENT
`,
  )
  .get();

const verificationSeances = db
  .prepare(
    `
  SELECT COUNT(*) AS total FROM SEANCE
`,
  )
  .get();

console.log("Total événements :", verificationEvenements.total);
console.log("Total séances :", verificationSeances.total);

const evenementsAvecSeances = db
  .prepare(
    `
  SELECT
    e.idEvenement,
    e.titre,
    s.date,
    s.heureDebut,
    s.lieu
  FROM EVENEMENT AS e
  JOIN SEANCE AS s
    ON e.idEvenement = s.idEvenement
`,
  )
  .all();

console.log("Événements avec leurs séances :", evenementsAvecSeances);
