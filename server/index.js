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
  try {
    const influenceurs = await prisma.influenceurs.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    const influenceursWithVoteCount = influenceurs.map((influenceur) => ({
      ...influenceur,
      voteCount: influenceur._count.votes,
    }));

    res.json(influenceursWithVoteCount);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des influenceurs" });
  }
});

// Route pour voter
app.post("/api/votes", async (req, res) => {
  const { influenceurId: influenceurId, phoneNumber } = req.body;

  try {
    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findFirst({
      where: { phoneNumber },
    });

    if (existingVote) {
      return res.status(400).json({ error: "Vous avez déjà voté" });
    }

    // Créer le vote
    const vote = await prisma.vote.create({
      data: {
        influenceurId: influenceurId,
        phoneNumber,
        timestamp: new Date(),
      },
    });

    // Récupérer le nouveau compte de votes
    const updatedInfluenceur = await prisma.influenceurs.findUnique({
      where: { id: influenceurId },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    // Émettre l'événement de mise à jour en temps réel
    io.emit("voteUpdate", {
      influenceurId,
      newVoteCount: updatedInfluenceur._count.votes,
    });

    res.json(vote);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement du vote" });
  }
});


// Lister toutes les routes
app._router.stack
  .filter((layer) => layer.route)
  .map((layer) => ({
    path: layer.route.path,
    methods: Object.keys(layer.route.methods),
  }))
  .forEach((route) => {
    console.log(`Méthodes: ${route.methods.join(", ")}, Chemin: ${route.path}`);
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
