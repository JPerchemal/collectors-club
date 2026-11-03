import http from "node:http";
import { db } from "./database.js";
import { randomBytes, createHash } from "node:crypto";
import { envoyerEmailConfirmation } from "./email.js";

const serveur = http.createServer((requete, reponse) => {
  reponse.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  reponse.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  reponse.setHeader("Access-Control-Allow-Headers", "Content-Type");
  console.log(requete.method);

  const url = new URL(requete.url, "http://localhost:3000");
  const morceaux = url.pathname.split("/");
  console.log("Morceaux de l'URL :", morceaux);

  if (requete.method === "OPTIONS") {
    reponse.writeHead(204);
    reponse.end();
    return;
  }

  if (requete.url === "/bonjour" && requete.method === "GET") {
    reponse.end("Bonjour et bienvenue au Collector's Club !");
  } else if (requete.url === "/evenements" && requete.method === "GET") {
    const evenements = db.prepare("SELECT * FROM EVENEMENT;").all();

    reponse.setHeader("Content-Type", "application/json");
    reponse.end(JSON.stringify(evenements));
  } else if (requete.url === "/seances" && requete.method === "GET") {
    const seances = db
      .prepare(
        `
    SELECT
        s.idSeance,
        s.date,
        s.heureDebut,
        s.heureFin,
        s.lieu,
        e.titre,
        e.description,
        e.affiche
    FROM SEANCE AS s
    JOIN EVENEMENT AS e
        ON s.idEvenement = e.idEvenement;
`,
      )
      .all();

    reponse.setHeader("Content-Type", "application/json");
    reponse.end(JSON.stringify(seances));
  } else if (url.pathname === "/evenements" && requete.method === "POST") {
    let body = "";

    requete.on("data", (morceau) => {
      body += morceau.toString();
    });

    requete.on("end", () => {
      console.log("Body reçu :", body);

      let evenement;

      try {
        evenement = JSON.parse(body);

        //vérification que la valeur reçue est bien un objet exploitable
        if (
          evenement === null ||
          typeof evenement !== "object" ||
          Array.isArray(evenement)
        ) {
          reponse.writeHead(400, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "Les données doivent être un objet JSON.",
            }),
          );

          return;
        }

        console.log("Titre de l'événement :", evenement.titre);

        const formatDate = /^\d{4}-\d{2}-\d{2}$/;
        const formatHeure = /^([01]\d|2[0-3]):[0-5]\d$/;

        // Première vérification : champs obligatoires
        if (
          typeof evenement.titre !== "string" ||
          !evenement.titre.trim() ||
          typeof evenement.date !== "string" ||
          !evenement.date.trim() ||
          typeof evenement.heureDebut !== "string" ||
          !evenement.heureDebut.trim() ||
          typeof evenement.lieu !== "string" ||
          !evenement.lieu.trim()
        ) {
          reponse.writeHead(400, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "Des informations obligatoires sont manquantes.",
            }),
          );

          return;
        }

        // Deuxième vérification : format de la date
        if (!formatDate.test(evenement.date.trim())) {
          reponse.writeHead(400, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "La date doit être au format AAAA-MM-JJ.",
            }),
          );

          return;
        }

        // Préparation de la vérification d'une date réelle
        const morceaux = evenement.date.trim().split("-");

        const annee = Number(morceaux[0]);
        const mois = Number(morceaux[1]);
        const jour = Number(morceaux[2]);
        // Nous devons convertir le numéro du mois de notre calendrier vers celui utilisé par JavaScript à cause de la méthode new date();
        const date = new Date(annee, mois - 1, jour);
        const dateValide =
          date.getFullYear() === annee &&
          date.getMonth() === mois - 1 &&
          date.getDate() === jour;

        // Vérification : la date existe-t-elle réellement ?
        if (!dateValide) {
          reponse.writeHead(400, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "La date indiquée n'existe pas.",
            }),
          );

          return;
        }

        // Troisième vérification : format de l'heure
        if (!formatHeure.test(evenement.heureDebut.trim())) {
          reponse.writeHead(400, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "L'heure doit être au format HH:MM.",
            }),
          );

          return;
        }
      } catch (erreur) {
        console.error("Erreur JSON :", erreur.message);

        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Le JSON envoyé est invalide.",
          }),
        );

        return;
      }

      // Démarrage de la transaction SQLite
      try {
        db.exec("BEGIN");

        const requeteEvenement = db.prepare(
          "INSERT INTO EVENEMENT (titre) VALUES (?)",
        );

        const resultat = requeteEvenement.run(evenement.titre);
        const idEvenement = resultat.lastInsertRowid;

        const requeteSeance = db.prepare(
          `INSERT INTO SEANCE (date, heureDebut, lieu, idEvenement)
   VALUES (?, ?, ?, ?)`,
        );

        requeteSeance.run(
          evenement.date,
          evenement.heureDebut,
          evenement.lieu,
          idEvenement,
        );
        // Les deux insertions ont réussi.
        db.exec("COMMIT");
        // Une des instruction n'a pas réussi.
      } catch (erreur) {
        console.error("Erreur SQLite :", erreur.message);

        if (db.isTransaction) {
          try {
            db.exec("ROLLBACK");
          } catch (erreurRollback) {
            console.error("Erreur ROLLBACK :", erreurRollback.message);
          }
        }

        reponse.writeHead(500, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Impossible d'enregistrer l'événement.",
          }),
        );

        return;
      }

      // Réponse HTTP
      reponse.writeHead(201, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          message: "L'événement et sa séance ont été créés avec succès.",
        }),
      );
    });
  } else if (url.pathname === "/seances" && requete.method === "POST") {
    // 1. Réception des données
    let body = "";

    requete.on("data", (morceau) => {
      body += morceau.toString();
    });

    requete.on("end", () => {
      let seance;

      // 2. Conversion du JSON
      try {
        seance = JSON.parse(body);
      } catch (erreur) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Le JSON envoyé est invalide.",
          }),
        );
        return;
      }

      // 3. Vérification de l'objet reçu
      if (
        seance === null ||
        typeof seance !== "object" ||
        Array.isArray(seance)
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Les données doivent être un objet JSON.",
          }),
        );
        return;
      }

      // 4. Vérification de l'identifiant de l'événement
      if (
        !Number.isSafeInteger(seance.idEvenement) ||
        seance.idEvenement <= 0
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Identifiant d'événement invalide.",
          }),
        );
        return;
      }

      // 5. Vérification des champs obligatoires
      if (
        typeof seance.date !== "string" ||
        !seance.date.trim() ||
        typeof seance.heureDebut !== "string" ||
        !seance.heureDebut.trim() ||
        typeof seance.lieu !== "string" ||
        !seance.lieu.trim()
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "La date, l'heure de début et le lieu sont obligatoires.",
          }),
        );
        return;
      }

      // 6. Vérification du format de la date
      const formatDate = /^\d{4}-\d{2}-\d{2}$/;
      const dateTexte = seance.date.trim();

      if (!formatDate.test(dateTexte)) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "La date doit être au format AAAA-MM-JJ.",
          }),
        );
        return;
      }

      // 7. Vérification que la date existe réellement
      const partiesDate = dateTexte.split("-");
      const annee = Number(partiesDate[0]);
      const mois = Number(partiesDate[1]);
      const jour = Number(partiesDate[2]);

      const dateVerifiee = new Date(annee, mois - 1, jour);

      if (
        dateVerifiee.getFullYear() !== annee ||
        dateVerifiee.getMonth() !== mois - 1 ||
        dateVerifiee.getDate() !== jour
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "La date indiquée n'existe pas.",
          }),
        );
        return;
      }

      // 8. Vérification du format des horaires
      const formatHeure = /^([01]\d|2[0-3]):[0-5]\d$/;
      const heureDebut = seance.heureDebut.trim();

      let heureFin = null;

      if (
        seance.heureFin !== undefined &&
        seance.heureFin !== null &&
        seance.heureFin !== ""
      ) {
        if (typeof seance.heureFin !== "string") {
          reponse.writeHead(400, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "L'heure de fin doit être du texte au format HH:MM.",
            }),
          );
          return;
        }

        heureFin = seance.heureFin.trim();
      }

      if (
        !formatHeure.test(heureDebut) ||
        (heureFin !== null && !formatHeure.test(heureFin))
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Les horaires doivent être au format HH:MM.",
          }),
        );
        return;
      }

      // 9. Vérification de l'ordre des horaires
      if (heureFin !== null && heureFin <= heureDebut) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "L'heure de fin doit être après l'heure de début.",
          }),
        );
        return;
      }

      // 10. Vérification de l'existence de l'événement
      try {
        const evenement = db
          .prepare(
            `
        SELECT idEvenement
        FROM EVENEMENT
        WHERE idEvenement = ?
      `,
          )
          .get(seance.idEvenement);

        if (!evenement) {
          reponse.writeHead(404, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "L'événement associé est introuvable.",
            }),
          );
          return;
        }

        // 11. Création de la séance
        const resultat = db
          .prepare(
            `
        INSERT INTO SEANCE (
          date,
          heureDebut,
          heureFin,
          lieu,
          idEvenement
        )
        VALUES (?, ?, ?, ?, ?)
      `,
          )
          .run(
            dateTexte,
            heureDebut,
            heureFin,
            seance.lieu.trim(),
            seance.idEvenement,
          );

        // 12. Confirmation
        reponse.writeHead(201, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            message: "La séance a été créée avec succès.",
            idSeance: Number(resultat.lastInsertRowid),
            idEvenement: seance.idEvenement,
          }),
        );
      } catch (erreur) {
        console.error("Erreur lors de la création de la séance :", erreur);

        reponse.writeHead(500, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Erreur lors de la création de la séance.",
          }),
        );
      }
    });
  } else if (
    morceaux[1] === "evenements" &&
    morceaux.length === 3 &&
    requete.method === "PUT"
  ) {
    const idEvenement = Number(morceaux[2]);

    // 1. Vérification de l'identifiant
    if (!Number.isSafeInteger(idEvenement) || idEvenement <= 0) {
      reponse.writeHead(400, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Identifiant d'événement invalide.",
        }),
      );
      return;
    }

    // 2. Réception des données
    let body = "";

    requete.on("data", (morceau) => {
      body += morceau.toString();
    });

    requete.on("end", () => {
      let evenement;

      // 3. Conversion du JSON
      try {
        evenement = JSON.parse(body);
      } catch (erreur) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Le JSON envoyé est invalide.",
          }),
        );
        return;
      }

      // 4. Vérification de l'objet reçu
      if (
        evenement === null ||
        typeof evenement !== "object" ||
        Array.isArray(evenement)
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Les données doivent être un objet JSON.",
          }),
        );
        return;
      }

      // 5. Vérification du titre
      if (typeof evenement.titre !== "string" || !evenement.titre.trim()) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Le titre de l'événement est obligatoire.",
          }),
        );
        return;
      }

      // 6. Vérification des champs facultatifs
      if (
        (evenement.description !== undefined &&
          evenement.description !== null &&
          typeof evenement.description !== "string") ||
        (evenement.affiche !== undefined &&
          evenement.affiche !== null &&
          typeof evenement.affiche !== "string")
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "La description et l'affiche doivent être du texte.",
          }),
        );
        return;
      }

      // 7. Préparation des valeurs
      const titre = evenement.titre.trim();
      const description = evenement.description ?? null;
      const affiche = evenement.affiche ?? null;

      // 8. Modification dans SQLite
      try {
        const modifierEvenement = db.prepare(`
        UPDATE EVENEMENT
        SET titre = ?, description = ?, affiche = ?
        WHERE idEvenement = ?
      `);

        const resultat = modifierEvenement.run(
          titre,
          description,
          affiche,
          idEvenement,
        );

        // 9. Événement introuvable
        if (resultat.changes === 0) {
          reponse.writeHead(404, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "Événement introuvable.",
            }),
          );
          return;
        }

        // 10. Modification réussie
        reponse.writeHead(200, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            message: "L'événement a été modifié avec succès.",
            idEvenement: idEvenement,
          }),
        );
      } catch (erreur) {
        console.error("Erreur lors de la modification :", erreur);

        reponse.writeHead(500, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Erreur lors de la modification de l'événement.",
          }),
        );
      }
    });
  } else if (
    morceaux[1] === "seances" &&
    morceaux.length === 3 &&
    requete.method === "PUT"
  ) {
    const idSeance = Number(morceaux[2]);

    // 1. Vérification de l'identifiant
    if (!Number.isSafeInteger(idSeance) || idSeance <= 0) {
      reponse.writeHead(400, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Identifiant de séance invalide.",
        }),
      );
      return;
    }

    // 2. Réception des données
    let body = "";

    requete.on("data", (morceau) => {
      body += morceau.toString();
    });

    requete.on("end", () => {
      let seance;

      // 3. Conversion du JSON
      try {
        seance = JSON.parse(body);
      } catch (erreur) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Le JSON envoyé est invalide.",
          }),
        );
        return;
      }

      // 4. Vérification de l'objet reçu
      if (
        seance === null ||
        typeof seance !== "object" ||
        Array.isArray(seance)
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Les données doivent être un objet JSON.",
          }),
        );
        return;
      }

      // 5. Vérification des champs obligatoires
      if (
        typeof seance.date !== "string" ||
        !seance.date.trim() ||
        typeof seance.heureDebut !== "string" ||
        !seance.heureDebut.trim() ||
        typeof seance.lieu !== "string" ||
        !seance.lieu.trim()
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "La date, l'heure de début et le lieu sont obligatoires.",
          }),
        );
        return;
      }

      // 6. Vérification du format de la date
      const formatDate = /^\d{4}-\d{2}-\d{2}$/;

      const dateTexte = seance.date.trim();

      if (!formatDate.test(dateTexte)) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "La date doit être au format AAAA-MM-JJ.",
          }),
        );
        return;
      }

      // 7. Vérification que la date existe réellement
      const partiesDate = dateTexte.split("-");
      const annee = Number(partiesDate[0]);
      const mois = Number(partiesDate[1]);
      const jour = Number(partiesDate[2]);

      const dateVerifiee = new Date(annee, mois - 1, jour);

      if (
        dateVerifiee.getFullYear() !== annee ||
        dateVerifiee.getMonth() !== mois - 1 ||
        dateVerifiee.getDate() !== jour
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "La date indiquée n'existe pas.",
          }),
        );
        return;
      }

      // 8. Vérification des horaires
      const formatHeure = /^([01]\d|2[0-3]):[0-5]\d$/;

      const heureDebut = seance.heureDebut.trim();

      const heureFin =
        seance.heureFin === undefined ||
        seance.heureFin === null ||
        seance.heureFin === ""
          ? null
          : seance.heureFin;

      if (
        !formatHeure.test(heureDebut) ||
        (heureFin !== null &&
          (typeof heureFin !== "string" || !formatHeure.test(heureFin)))
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Les horaires doivent être au format HH:MM.",
          }),
        );
        return;
      }

      // 9. Vérification de l'ordre des horaires
      if (heureFin !== null && heureFin <= heureDebut) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "L'heure de fin doit être après l'heure de début.",
          }),
        );
        return;
      }

      // 10. Modification dans SQLite
      try {
        const modifierSeance = db.prepare(`
        UPDATE SEANCE
        SET date = ?, heureDebut = ?, heureFin = ?, lieu = ?
        WHERE idSeance = ?
      `);

        const resultat = modifierSeance.run(
          dateTexte,
          heureDebut,
          heureFin,
          seance.lieu.trim(),
          idSeance,
        );

        // 11. Séance introuvable
        if (resultat.changes === 0) {
          reponse.writeHead(404, {
            "Content-Type": "application/json",
          });

          reponse.end(
            JSON.stringify({
              erreur: "Séance introuvable.",
            }),
          );
          return;
        }

        // 12. Modification réussie
        reponse.writeHead(200, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            message: "La séance a été modifiée avec succès.",
            idSeance: idSeance,
          }),
        );
      } catch (erreur) {
        console.error("Erreur lors de la modification :", erreur);

        reponse.writeHead(500, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Erreur lors de la modification de la séance.",
          }),
        );
      }
    });
  } else if (
    morceaux[1] === "seances" &&
    morceaux.length === 3 &&
    requete.method === "DELETE"
  ) {
    const idSeance = Number(morceaux[2]);

    // 1. Vérification de l'identifiant
    if (!Number.isSafeInteger(idSeance) || idSeance <= 0) {
      reponse.writeHead(400, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Identifiant de séance invalide.",
        }),
      );
      return;
    }

    try {
      // 2. Début de la transaction
      db.exec("BEGIN IMMEDIATE");

      // 3. Recherche de la séance
      const seance = db
        .prepare(
          `
      SELECT idEvenement
      FROM SEANCE
      WHERE idSeance = ?
    `,
        )
        .get(idSeance);

      if (!seance) {
        db.exec("ROLLBACK");

        reponse.writeHead(404, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Séance introuvable.",
          }),
        );
        return;
      }

      // 4. Comptage des séances de cet événement
      const resultat = db
        .prepare(
          `
      SELECT COUNT(*) AS nombreSeances
      FROM SEANCE
      WHERE idEvenement = ?
    `,
        )
        .get(seance.idEvenement);

      // 5. Protection de la dernière séance
      if (resultat.nombreSeances <= 1) {
        db.exec("ROLLBACK");

        reponse.writeHead(409, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur:
              "Impossible de supprimer la dernière séance d'un événement. Supprimez plutôt l'événement.",
          }),
        );
        return;
      }

      // 6. Suppression de la séance
      const suppression = db
        .prepare(
          `
      DELETE FROM SEANCE
      WHERE idSeance = ?
    `,
        )
        .run(idSeance);

      db.exec("COMMIT");

      // 7. Confirmation
      reponse.writeHead(200, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          message: "La séance a été supprimée avec succès.",
          idSeance: idSeance,
        }),
      );
    } catch (erreur) {
      if (db.isTransaction) {
        try {
          db.exec("ROLLBACK");
        } catch (erreurRollback) {
          console.error("Erreur ROLLBACK :", erreurRollback);
        }
      }

      console.error("Erreur lors de la suppression :", erreur);

      reponse.writeHead(500, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Erreur lors de la suppression de la séance.",
        }),
      );
    }
  } else if (
    morceaux[1] === "evenements" &&
    morceaux.length === 3 &&
    requete.method === "DELETE"
  ) {
    const idEvenement = Number(morceaux[2]);

    // 1. Vérification de l'identifiant
    if (!Number.isSafeInteger(idEvenement) || idEvenement <= 0) {
      reponse.writeHead(400, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Identifiant d'événement invalide.",
        }),
      );
      return;
    }
    try {
      // 2. Suppression de l'événement
      const suppression = db
        .prepare(
          `
      DELETE FROM EVENEMENT
      WHERE idEvenement = ?
    `,
        )
        .run(idEvenement);

      // 3. Événement introuvable
      if (suppression.changes === 0) {
        reponse.writeHead(404, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Événement introuvable.",
          }),
        );
        return;
      }

      // 4. Confirmation
      reponse.writeHead(200, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          message: "L'événement et ses séances ont été supprimés avec succès.",
          idEvenement: idEvenement,
        }),
      );
    } catch (erreur) {
      console.error("Erreur lors de la suppression :", erreur);

      reponse.writeHead(500, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Erreur lors de la suppression de l'événement.",
        }),
      );
    }
  } else if (
    url.pathname === "/abonnes/confirmation" &&
    requete.method === "GET"
  ) {
    const tokenRecu = url.searchParams.get("token");

    if (!tokenRecu) {
      reponse.writeHead(400, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Jeton de confirmation manquant.",
        }),
      );

      return;
    }

    const formatValide = /^[0-9a-f]{64}$/.test(tokenRecu);

    if (!formatValide) {
      reponse.writeHead(400, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Format du jeton de confirmation invalide.",
        }),
      );

      return;
    }

    const tokenHashRecu = createHash("sha256").update(tokenRecu).digest("hex");

    let confirmation;
    try {
      const requeteConfirmation = db.prepare(`
        SELECT *
        FROM CONFIRMATION_ABONNE
        WHERE tokenHash = ?
      `);

      confirmation = requeteConfirmation.get(tokenHashRecu);
    } catch (erreur) {
      console.error("Erreur lors de la recherche du jeton :", erreur);

      reponse.writeHead(500, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Une erreur est survenue lors de la confirmation.",
        }),
      );

      return;
    }
    // si SQLite ne trouve aucune ligne, .get() renvoie undefined et !undefined vaut true
    if (!confirmation) {
      reponse.writeHead(400, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Jeton de confirmation invalide ou expiré.",
        }),
      );

      return;
    }

    const maintenant = new Date();
    const expiration = new Date(confirmation.dateExpiration);
    const jetonExpire = maintenant >= expiration;
    if (jetonExpire) {
      reponse.writeHead(400, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Jeton de confirmation invalide ou expiré.",
        }),
      );

      return;
    }

    const dateConfirmation = new Date().toISOString();

    let transactionActive = false;
    try {
      const requeteMiseAJour = db.prepare(`
        UPDATE ABONNE
        SET dateConfirmation = ?
        WHERE email = ?
      `);
      const requeteSuppression = db.prepare(`
        DELETE FROM CONFIRMATION_ABONNE
        WHERE email = ?
      `);

      db.exec("BEGIN");
      transactionActive = true;

      const resultatMiseAJour = requeteMiseAJour.run(
        dateConfirmation,
        confirmation.email,
      );
      if (resultatMiseAJour.changes !== 1) {
        throw new Error("Aucun abonné correspondant à confirmer.");
      }

      const resultatSuppression = requeteSuppression.run(confirmation.email);
      if (resultatSuppression.changes !== 1) {
        throw new Error("Le jeton de confirmation n'a pas été supprimé.");
      }

      db.exec("COMMIT");
      transactionActive = false;

      reponse.writeHead(200, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          message: "Votre inscription a été confirmée avec succès.",
        }),
      );

      return;
    } catch (erreur) {
      if (transactionActive) {
        try {
          db.exec("ROLLBACK");
        } catch (erreurRollback) {
          console.error("Erreur lors du ROLLBACK :", erreurRollback);
        }
      }

      console.error("Erreur lors de la confirmation :", erreur);

      reponse.writeHead(500, {
        "Content-Type": "application/json",
      });

      reponse.end(
        JSON.stringify({
          erreur: "Une erreur est survenue lors de la confirmation.",
        }),
      );

      return;
    }
  } else if (url.pathname === "/abonnes" && requete.method === "POST") {
    // 1. Réception des données
    let body = "";

    requete.on("data", (morceau) => {
      body += morceau.toString();
    });

    requete.on("end", async () => {
      let abonne;

      // 2. Conversion du JSON
      try {
        abonne = JSON.parse(body);
      } catch {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Le JSON envoyé est invalide.",
          }),
        );
        return;
      }

      // 3. Vérification de l'objet reçu
      if (
        abonne === null ||
        typeof abonne !== "object" ||
        Array.isArray(abonne)
      ) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Les données doivent être un objet JSON.",
          }),
        );
        return;
      }

      // 4. Vérification du champ email
      if (typeof abonne.email !== "string" || !abonne.email.trim()) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Une adresse e-mail est obligatoire.",
          }),
        );
        return;
      }

      // 5. Vérification du format de l'adresse e-mail
      const email = abonne.email.trim().toLowerCase();
      const formatEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!formatEmail.test(email)) {
        reponse.writeHead(400, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Le format de l'adresse e-mail est invalide.",
          }),
        );
        return;
      }

      // 6. Enregistrement de l'abonné dans SQLite
      let transactionActive = false;
      let token = null;
      try {
        db.exec("BEGIN");
        transactionActive = true;

        const dateInscription = new Date().toISOString();

        const resultat = db
          .prepare(
            `
          INSERT OR IGNORE INTO ABONNE (
            email,
            dateInscription,
            dateConfirmation
          )
          VALUES (?, ?, ?)
          `,
          )
          .run(email, dateInscription, null);

        const nouvelAbonne = resultat.changes === 1;
        let abonneExistant = null;
        if (!nouvelAbonne) {
          abonneExistant = db
            .prepare("SELECT dateConfirmation FROM ABONNE WHERE email = ?")
            .get(email);
        }

        const abonneNonConfirme =
          abonneExistant !== null && abonneExistant.dateConfirmation === null;
        let derniereTentative = null;
        if (abonneNonConfirme) {
          derniereTentative = db
            .prepare(
              "SELECT dateDernierEnvoi FROM CONFIRMATION_ABONNE WHERE email = ?",
            )
            .get(email);
        }

        const cinqMinutes = 5 * 60 * 1000;
        let renvoiAutorise = false;
        if (abonneNonConfirme) {
          const dateDernierEnvoi = derniereTentative?.dateDernierEnvoi;

          if (dateDernierEnvoi === null || dateDernierEnvoi === undefined) {
            renvoiAutorise = true;
          } else {
            const dernierEnvoi = new Date(dateDernierEnvoi).getTime();

            if (Number.isNaN(dernierEnvoi)) {
              throw new Error("Date du dernier envoi invalide.");
            }

            const delaiEcoule = Date.now() - dernierEnvoi;

            renvoiAutorise = delaiEcoule >= cinqMinutes;
          }
        }

        const renouvelerConfirmation = db.prepare(`
          INSERT INTO CONFIRMATION_ABONNE (
            email,
            tokenHash,
            dateExpiration,
            dateDernierEnvoi
          )
          VALUES (?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            tokenHash = excluded.tokenHash,
            dateExpiration = excluded.dateExpiration,
            dateDernierEnvoi = excluded.dateDernierEnvoi
        `);

        if (nouvelAbonne || (abonneNonConfirme && renvoiAutorise)) {
          // Génération du jeton de confirmation
          token = randomBytes(32).toString("hex");

          // Calcul de son empreinte SHA-256
          const tokenHash = createHash("sha256").update(token).digest("hex");

          const maintenant = Date.now();
          const dateDernierEnvoi = new Date(maintenant).toISOString();

          // Date d'expiration du jeton : 24 heures
          const dateExpiration = new Date(
            maintenant + 24 * 60 * 60 * 1000,
          ).toISOString();

          renouvelerConfirmation.run(
            email,
            tokenHash,
            dateExpiration,
            dateDernierEnvoi,
          );
        }

        // Validation de la transaction
        db.exec("COMMIT");
        transactionActive = false;

        let emailAccepte = false;

        // 7. Envoi de l'e-mail de confirmation
        if (token !== null) {
          try {
            await envoyerEmailConfirmation(email, token);
            emailAccepte = true;
          } catch (erreurEmail) {
            console.error("Erreur lors de l'envoi de l'e-mail :", erreurEmail);

            try {
              const annulerTentative = db.prepare(`
                UPDATE CONFIRMATION_ABONNE
                SET dateDernierEnvoi = NULL
                WHERE email = ?
                AND tokenHash = ?
              `);

              const tokenHash = createHash("sha256")
                .update(token)
                .digest("hex");

              const resultatAnnulation = annulerTentative.run(email, tokenHash);

              if (resultatAnnulation.changes === 1) {
                console.log(
                  "Réservation de l'envoi annulée après une erreur SMTP.",
                );
              } else {
                console.log(
                  "Aucune réservation à annuler pour cette tentative.",
                );
              }
            } catch (erreurSQLite) {
              console.error(
                "Impossible d'annuler la réservation de l'envoi :",
                erreurSQLite,
              );
            }
          }

          console.log(
            emailAccepte
              ? "E-mail de confirmation accepté par le serveur SMTP."
              : "Échec de l'envoi de l'e-mail de confirmation.",
          );
        }

        // 8. Confirmation de l'inscription
        const codeHTTP = 202;

        reponse.writeHead(codeHTTP, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            message: "Votre demande d'inscription a été enregistrée.",
          }),
        );
      } catch (erreur) {
        if (transactionActive) {
          try {
            db.exec("ROLLBACK");
          } catch (erreurRollback) {
            console.error("Erreur lors du ROLLBACK :", erreurRollback);
          }
        }

        console.error("Erreur lors de l'inscription :", erreur);

        reponse.writeHead(500, {
          "Content-Type": "application/json",
        });

        reponse.end(
          JSON.stringify({
            erreur: "Impossible d'enregistrer l'inscription.",
          }),
        );
      }
    });
  } else {
    reponse.writeHead(404, {
      "Content-Type": "application/json",
    });

    reponse.end(
      JSON.stringify({
        erreur: "Route introuvable.",
      }),
    );
  }
});

serveur.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});
