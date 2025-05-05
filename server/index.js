import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { log } from "console";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

// Configuration correcte de Socket.IO avec CORS
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
  });
});

// Routes pour les influenceurs
app.get("/api/influenceurs", async (req, res) => {
  try {
    const influenceurs = await prisma.influenceurs.findMany({
      include: {
        votes: true,
      },
    });

    const influenceursWithVoteCount = influenceurs.map((influenceur) => ({
      id: influenceur.id,
      name: influenceur.name,
      imageUrl: influenceur.imageUrl,
      voteCount: influenceur.votes.length,
    }));

    res.json(influenceursWithVoteCount);
  } catch (error) {
    console.error("Erreur lors de la récupération des influenceurs:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des influenceurs" });
  }
});

/**
 * Route pour Supprimer un influenceur
 * @route DELETE /api/influenceurs/:id
 * @param {string} id - ID de l'influenceur à supprimer
 * @returns {object} - Message de succès
 * @throws {404} - Si l'influenceur n'est pas trouvé
 * @throws {500} - Erreur serveur lors de la suppression de l'influenceur
 */
app.delete("/api/influenceurs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si l'influenceur existe
    const existingInfluenceur = await prisma.influenceurs.findUnique({
      where: { id: id },
    });

    if (!existingInfluenceur) {
      return res.status(404).json({ error: "Influenceur non trouvé" });
    }

    // Supprimer l'influenceur
    await prisma.influenceurs.delete({
      where: { id: id },
    });

    // Émettre l’événement de mise à jour en temps réel
    io.emit("influenceursUpdate", { deletedInfluenceurId: id });

    res.json({ message: "Influenceur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'influenceur:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

/**
 * Route pour créer un nouvel influenceur
 * @route POST /api/influenceurs
 * @param {string} name - Nom de l'influenceur
 * @param {string} imageUrl - URL de l'image de l'influenceur
 * @returns {object} - Message de succès et l'influenceur créé
 * @throws {400} - Si le nom ou l'image de l'influenceur est manquant
 * @throws {409} - Si l'influenceur existe déjà
 * @throws {500} - Erreur serveur lors de la création de l'influenceur
 */
app.post("/api/influenceurs", async (req, res) => {
  const { name, imageUrl } = req.body;

  // Vérification des données envoyées
  if (!name || !imageUrl) {
    return res
      .status(400)
      .json({ error: "Le nom et l'image de l'influenceur sont requis" });
  }

  try {
    // Vérifier si l'influenceur existe déjà
    const existingInfluenceur = await prisma.influenceurs.findFirst({
      where: { name: name },
    });

    if (existingInfluenceur) {
      return res.status(409).json({ error: "Cet influenceur existe déjà" });
    }

    // Création de l'influenceur
    const newInfluenceur = await prisma.influenceurs.create({
      data: {
        name,
        imageUrl,
      },
    });

    res.status(201).json({
      message: "Influenceur créé avec succès",
      influenceur: newInfluenceur,
    });

    // Émettre l'événement de mise à jour en temps réel
    io.emit("influenceursUpdate", { newInfluenceur });
  } catch (error) {
    console.error("Erreur lors de la création de l'influenceur:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'influenceur" });
  }
});

/**
 * Route pour vérifier si un utilisateur a déjà voté
 * @route GET /api/votes
 * @param {string} phoneNumber - Numéro de téléphone de l'utilisateur
 * @returns {object} - Détails du vote
 * @throws {400} - Si le numéro de téléphone est manquant
 * @throws {500} - Erreur serveur lors de la vérification du vote
 */
app.get("/api/votes", async (req, res) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Numéro de téléphone manquant" });
  }

  try {
    const existingVote = await prisma.votes.findFirst({
      where: { phoneNumber: phoneNumber.toString() },
    });

    // Vérifier si l'utilisateur a déjà voté
    if (existingVote && existingVote.isValidated) {
      return res.status(400).json({ message: "Ce numéro a déjà voté." });
    }

    res.json({ hasVoted: !!existingVote });
  } catch (error) {
    console.error("Erreur lors de la vérification du vote:", error);
    res.status(500).json({ error: "Erreur serveur pendant la vérification" });
  }
});

/**
 * Route pour enregistrer un vote
 * @route POST /api/votes
 * @param {string} influenceurId - ID de l'influenceur
 * @param {string} phoneNumber - Numéro de téléphone de l'utilisateur
 * @returns {object} - Détails du vote enregistré
 * @throws {400} - Si l'utilisateur a déjà voté
 * @throws {500} - Erreur serveur lors de l'enregistrement du vote
 */
app.post("/api/votes", async (req, res) => {
  const { influenceurId, phoneNumber } = req.body;

  try {
    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.votes.findFirst({
      where: { phoneNumber },
    });

    if (existingVote) {
      return res.status(400).json({ error: "Vous avez déjà voté" });
    }

    // Créer le vote
    const vote = await prisma.votes.create({
      data: {
        influenceurId,
        phoneNumber,
        timestamp: new Date(),
      },
    });

    // Récupérer le nouveau compte de votes
    const updatedInfluenceur = await prisma.influenceurs.findUnique({
      where: { id: influenceurId },
      include: {
        votes: true,
      },
    });

    // Émettre l'événement de mise à jour en temps réel
    io.emit("voteUpdate", {
      influenceurId,
      newVoteCount: updatedInfluenceur.votes.length,
    });

    res.json(vote);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du vote:", error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du vote" });
  }
});

/**
 * Route pour valider un vote avec OTP
 * @route POST /api/validate-vote
 * @param {string} phoneNumber - Numéro de téléphone de l'utilisateur
 * @param {string} otp - Code OTP
 * @returns {object} - Détails du vote validé
 * @throws {400} - Si le numéro de téléphone
 */
app.post("/api/otp", async (req, res) => {
  const { phoneNumber, influenceurId } = req.body;
  if (!phoneNumber || !influenceurId) {
    return res.status(400).json({ error: "Numéro ou influenceur manquant" });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("OTP généré:", otp);

    // Enregistrer ou mettre à jour le vote non validé
    // await prisma.votes.upsert({
    //   where: { phoneNumber },
    //   update: { otp, isValidated: false, influenceurId },
    //   create: { phoneNumber, otp, isValidated: false, influenceurId },
    // });

    // Envoi via WhatsApp API
    // await fetch(`${process.env.WHATSAPP_API_URL}`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     to: phoneNumber,
    //     type: "text",
    //     text: {
    //       body: `Votre code de vote est : *${otp}*. Saisissez-le dans le formulaire pour valider votre vote.`,
    //     },
    //   }),
    // });

    // res.json({ message: "OTP envoyé avec succès" });
  } catch (err) {
    console.error("Erreur OTP:", err);
    res.status(500).json({ error: "Échec de l'envoi de l'OTP" });
  }
});

/**
 * Route pour valider un vote avec OTP
 * @route POST /api/validate
 * @param {string} phoneNumber - Numéro de téléphone de l'utilisateur
 * @param {string} otp - Code OTP
 * @returns {object} - Détails du vote validé
 * @throws {400} - Si le numéro de téléphone ou l'OTP est manquant
 * @throws {500} - Erreur serveur lors de la validation du vote
 */
app.post("/api/validate", async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: "Numéro ou OTP manquant" });
  }

  try {
    const vote = await prisma.votes.findUnique({
      where: { phoneNumber },
    });

    if (!vote || vote.otp !== otp) {
      return res.status(400).json({ error: "OTP invalide" });
    }

    const updatedVote = await prisma.votes.update({
      where: { phoneNumber },
      data: { isValidated: true },
    });

    // Emit WebSocket event ici si nécessaire
    res.json({ message: "Vote validé", vote: updatedVote });
  } catch (err) {
    console.error("Erreur de validation:", err);
    res.status(500).json({ error: "Erreur serveur pendant la validation" });
  }
});

// Démarrer le serveur HTTP (pas app.listen)
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
