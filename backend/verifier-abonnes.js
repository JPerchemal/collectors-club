import { db } from "./database.js";

// ==================================================
// 1. Nombre total d'abonnés
// ==================================================

const totalAbonnes = db
  .prepare(
    `
    SELECT COUNT(*) AS total
    FROM ABONNE
  `,
  )
  .get();

console.log("\n===== STATISTIQUES DES ABONNÉS =====");

console.log("Nombre total d'abonnés :", totalAbonnes.total);

// ==================================================
// 2. Nombre d'abonnés confirmés
// ==================================================

const abonnesConfirmes = db
  .prepare(
    `
    SELECT COUNT(*) AS total
    FROM ABONNE
    WHERE dateConfirmation IS NOT NULL
  `,
  )
  .get();

console.log("Abonnés confirmés :", abonnesConfirmes.total);

// ==================================================
// 3. Nombre d'abonnés non confirmés
// ==================================================

const abonnesNonConfirmes = db
  .prepare(
    `
    SELECT COUNT(*) AS total
    FROM ABONNE
    WHERE dateConfirmation IS NULL
  `,
  )
  .get();

console.log("Abonnés non confirmés :", abonnesNonConfirmes.total);

// ==================================================
// 4. Liste des abonnés
// ==================================================

const listeAbonnes = db
  .prepare(
    `
    SELECT
      email,
      dateInscription,
      dateConfirmation
    FROM ABONNE
    ORDER BY dateInscription DESC
  `,
  )
  .all();

console.log("\n===== LISTE DES ABONNÉS =====");

console.table(listeAbonnes);

// ==================================================
// 5. Vérification des confirmations en attente
// ==================================================

const confirmationsEnAttente = db
  .prepare(
    `
    SELECT
      email,
      dateExpiration,
      dateDernierEnvoi
    FROM CONFIRMATION_ABONNE
    ORDER BY dateExpiration ASC
  `,
  )
  .all();

console.log("\n===== CONFIRMATIONS EN ATTENTE =====");

console.table(confirmationsEnAttente);

// ==================================================
// 6. Nombre de jetons expirés
// ==================================================

const dateActuelle = new Date().toISOString();

const jetonsExpires = db
  .prepare(
    `
    SELECT COUNT(*) AS total
    FROM CONFIRMATION_ABONNE
    WHERE dateExpiration <= ?
  `,
  )
  .get(dateActuelle);

console.log("\n===== VÉRIFICATION DES JETONS =====");

console.log("Jetons expirés :", jetonsExpires.total);

// ==================================================
// 7. Vérification des incohérences
// ==================================================

const confirmationsIncoherentes = db
  .prepare(
    `
    SELECT COUNT(*) AS total
    FROM CONFIRMATION_ABONNE AS c
    LEFT JOIN ABONNE AS a
      ON c.email = a.email
    WHERE a.email IS NULL
       OR a.dateConfirmation IS NOT NULL
  `,
  )
  .get();

console.log("\n===== INTÉGRITÉ DES DONNÉES =====");

console.log("Confirmations incohérentes :", confirmationsIncoherentes.total);

console.log("\n===== FIN DE LA VÉRIFICATION =====\n");
