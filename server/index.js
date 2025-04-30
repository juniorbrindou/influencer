import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

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
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling']
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
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
    res.status(500).json({ error: "Erreur lors de la récupération des influenceurs" });
  }
});

// Route pour vérifier si un numéro a déjà voté
app.get("/api/votes", async (req, res) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Numéro de téléphone manquant" });
  }

  try {
    const existingVote = await prisma.votes.findFirst({
      where: { phoneNumber: phoneNumber.toString() },
    });

    res.json({ hasVoted: !!existingVote });
  } catch (error) {
    console.error("Erreur lors de la vérification du vote:", error);
    res.status(500).json({ error: "Erreur serveur pendant la vérification" });
  }
});

// Route pour voter
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

// Démarrer le serveur HTTP (pas app.listen)
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});