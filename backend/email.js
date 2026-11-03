import nodemailer from "nodemailer";

// nodemailer.createTransport() Cette fonction crée un objet capable de communiquer avec un serveur de messagerie.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function verifierConnexionEmail() {
  await transporter.verify();
  console.log("Connexion SMTP Gmail réussie !");
}

export async function envoyerEmailTest(destinataire) {
  const resultat = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: destinataire,
    subject: "Collector's Club - Test d'envoi",
    text: "Bonjour ! Ceci est un e-mail de test envoyé depuis notre backend Node.js.",
  });

  return resultat.messageId;
}

export async function envoyerEmailConfirmation(destinataire, token) {
  const lienConfirmation = `http://localhost:3000/abonnes/confirmation?token=${token}`;

  const message = `Bonjour,

Vous avez demandé à recevoir les informations et les alertes du Collector's Club.

Pour confirmer votre inscription, cliquez sur le lien suivant :

${lienConfirmation}

Ce lien est valable pendant 24 heures.

Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.

À bientôt !

L'équipe du Collector's Club`;

  const resultat = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: destinataire,
    subject: "Collector's Club - Confirmez votre inscription",
    text: message,
  });

  return resultat.messageId;
}
