import { DatabaseSync } from "node:sqlite"; // Pour que node.js communique avec une base de données SQLite

const db = new DatabaseSync("./backend/collectors-club.db");

db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
    CREATE TABLE IF NOT EXISTS ABONNE (
        email TEXT PRIMARY KEY NOT NULL,
        dateInscription TEXT NOT NULL,
        dateConfirmation TEXT
    );
    -- Table des jetons de confirmation des abonnés
    CREATE TABLE IF NOT EXISTS CONFIRMATION_ABONNE (
        email TEXT PRIMARY KEY NOT NULL,
        tokenHash TEXT NOT NULL UNIQUE,
        dateExpiration TEXT NOT NULL,
        dateDernierEnvoi TEXT,
        FOREIGN KEY (email) REFERENCES ABONNE(email) ON DELETE CASCADE
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS EVENEMENT (
        idEvenement INTEGER PRIMARY KEY,
        titre TEXT NOT NULL,
        affiche TEXT,
        description TEXT
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS SEANCE (
        idSeance INTEGER PRIMARY KEY,
        date TEXT NOT NULL,
        heureDebut TEXT NOT NULL,
        heureFin TEXT,
        lieu TEXT,
        idEvenement INTEGER NOT NULL,

        FOREIGN KEY (idEvenement)
            REFERENCES EVENEMENT(idEvenement)
            ON DELETE CASCADE
    );
`);

export { db };
