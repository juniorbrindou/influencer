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
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connecté");

  socket.on("disconnect", () => {
    console.log("Client déconnecté");
  });
});

// Routes pour les influenceurs
app.get("/api/influenceurs", async (req, res) => {
  console.log("Requête reçue pour /api/influenceurs");

  try {
    const influenceurs = await prisma.influenceurs.findMany({
      include: {
        Votes: true, // On récupère aussi les votes
      },
    });

    // Maintenant on construit le résultat avec voteCount
    const influenceursWithVoteCount = influenceurs.map((influenceur) => ({
      id: influenceur.id,
      name: influenceur.name,
      imageUrl: influenceur.imageUrl,
      voteCount: influenceur.Votes.length, // Magie ici
    }));

    console.log("Réponse générée :", influenceursWithVoteCount);

    res.json(influenceursWithVoteCount);
  } catch (error) {
    console.error("Erreur lors de la récupération des influenceurs :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des influenceurs" });
  }
});

// Route pour vérifier si un numéro a déjà voté
app.get("/api/votes", async (req, res) => {
  const { phoneNumber } = req.query; // <-- attention ici, c'est dans req.query (pas body)

  if (!phoneNumber) {
    return res.status(400).json({ error: "Numéro de téléphone manquant" });
  }

  try {
    const existingVote = await prisma.votes.findFirst({
      where: { phoneNumber: phoneNumber },
    });

    if (existingVote) {
      return res.json({ hasVoted: true });
    } else {
      return res.json({ hasVoted: false });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du vote:", error);
    res.status(500).json({ error: "Erreur serveur pendant la vérification" });
  }
});

// POST vote
app.post("/api/votes", async (req, res) => {
  const { influenceurId: influenceurId, phoneNumber: phoneNumber } = req.body;
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
        influenceurId: influenceurId,
        phoneNumber: phoneNumber,
        timestamp: new Date(),
      },
    });

    // // Récupérer le nouveau compte de votes
    // const updatedInfluenceur = await prisma.influenceurs.findUnique({
    //   where: { id: influenceurId },
    //   include: {
    //     votes: true
    //   },
    // });

    // // Émettre l'événement de mise à jour en temps réel
    // io.emit("voteUpdate", {
    //   influenceurId,
    //   newVoteCount: updatedInfluenceur._count.votes,
    // });

    res.json(vote);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement du vote" });
  }
});

const PORT = process.env.PORT || 3000;
// Lister toutes les routes
app._router.stack
  .filter((layer) => layer.route)
  .map((layer) => ({
    path: layer.route.path,
    methods: Object.keys(layer.route.methods),
  }))
  .forEach((route) => {
    console.log(
      `Méthodes: ${route.methods.join(", ")}, Chemin: http://localhost:${PORT}${
        route.path
      }`
    );
  });

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
