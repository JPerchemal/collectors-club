import { db } from "./database.js";

const affiches = db
  .prepare(
    `
    SELECT idEvenement, titre, affiche
    FROM EVENEMENT
    ORDER BY idEvenement;
    `,
  )
  .all();

console.table(affiches);
