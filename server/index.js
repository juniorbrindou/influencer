import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Routes pour les influenceurs
app.get("/api/artists", async (req, res) => {
  try {
    const influenceurs = await prisma.artist.findMany({
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

    res.json(vote);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement du vote" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
