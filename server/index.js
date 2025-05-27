import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import twilio from "twilio";
import { redisClient } from "./lib/redis.js";
import requestIp from "request-ip";
dotenv.config();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(
  { maxHttpBufferSize: 1e6, pingTimeout: 60000 },
  app
);

// Configuration correcte de Socket.IO avec CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://influenceur2lannee.com",
      "https://www.influenceur2lannee.com",
    ],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket"],
  pingInterval: 10000, // Augmentez l'intervalle de ping
  pingTimeout: 5000, // Réduisez le timeout
  // maxHttpBufferSize: 1e5, // Limitez la taille des messages
  // serveClient: false, // Désactivez la livraison du client
});

app.use(requestIp.mw());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://influenceur2lannee.com",
      "https://www.influenceur2lannee.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Configuration de Multer (remplacez la section existante)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.isAbsolute(process.env.UPLOAD_DIR)
      ? process.env.UPLOAD_DIR
      : path.join(process.cwd(), process.env.UPLOAD_DIR);
    // const uploadDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

// Middleware pour servir les fichiers statiques (remplacez la section existante)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads"))
);

const upload = multer({ storage });

// Cache en mémoire pour les résultats en temps réel
let liveVoteCache = new Map(); // { influenceurId: { voteCount, categoryId, lastUpdate } }

// Fonction pour initialiser le cache depuis la DB (à appeler au démarrage)
async function initializeVoteCache() {
  try {
    console.log("🚀 Initialisation du cache des votes...");

    const influenceurs = await prisma.influenceurs.findMany({
      include: {
        _count: {
          select: {
            votes: {
              where: { isValidated: true },
            },
          },
        },
      },
    });

    influenceurs.forEach((inf) => {
      liveVoteCache.set(inf.id, {
        voteCount: inf._count.votes,
        categoryId: inf.categoryId,
        lastUpdate: new Date(),
      });
    });

    console.log(`✅ Cache initialisé avec ${liveVoteCache.size} influenceurs`);
  } catch (error) {
    console.error("❌ Erreur initialisation cache:", error);
  }
}

// Middleware pour servir les fichiers statiques

// Route d'upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier téléchargé" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);

  /**
   * Route pour enregistrer un vote
   * @route POST /api/votes
   * @param {string} influenceurId - ID de l'influenceur
   * @param {string} phoneNumber - Numéro de téléphone de l'utilisateur
   * @returns {object} - Détails du vote enregistré
   * @throws {400} - Si l'utilisateur a déjà voté
   * @throws {500} - Erreur serveur lors de l'enregistrement du vote
   */
  // venant de gpt
  // WebSocket event for submitting a vote
  // Modifiez la partie "submitVote" comme suit :

  // Handler de vote optimisé
  socket.on(
    "submitVote",
    async ({ influenceurId, phoneNumber, isSpecialVote, otp }) => {
      const politeErrorMessages = {
        rateLimit:
          "Trop de votes depuis cette adresse IP. Veuillez réessayer plus tard.",
        alreadyVotedSpecial:
          "Vous avez déjà voté dans la catégorie spéciale aujourd'hui. Merci de revenir demain.",
        needNormalVoteFirst:
          "Veuillez d'abord voter pour vos candidats habituels avant d'accéder au vote spécial.",
        allVotesUsed:
          "Vous avez épuisé tous vos votes pour aujourd'hui. Merci de revenir demain.",
        alreadyVotedCategory:
          "Vous avez déjà voté dans cette catégorie aujourd'hui à partir de ce terminal. Merci de revenir demain.",
        databaseError:
          "Désolé, un problème technique est survenu. Veuillez réessayer dans quelques instants.",
        timeoutError:
          "Le système est temporairement occupé. Veuillez réessayer dans un moment.",
      };

      console.log("📥 submitVote reçu:", {
        influenceurId,
        phoneNumber,
        isSpecialVote,
        otp,
      });

      try {
        const deviceHash = socket.handshake.headers["x-device-hash"];
        const clientIp =
          socket.request.headers["x-forwarded-for"] ||
          socket.request.connection.remoteAddress;

        // Récupérer l'influenceur avec timeout (optimisé - seulement les infos nécessaires)
        const influenceurWithCat = await prisma.influenceurs
          .findUnique({
            where: { id: influenceurId },
            select: {
              id: true,
              categoryId: true,
              category: { select: { id: true, name: true } },
            },
          })
          .catch((err) => {
            console.error("Erreur récupération influenceur:", err);
            throw new Error("timeoutError");
          });

        if (!influenceurWithCat) {
          socket.emit("voteError", "Influenceur non trouvé");
          return;
        }

        // Date du jour à minuit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Vérification des votes existants (optimisée - seulement les champs nécessaires)
        const existingVotes = await prisma.votes
          .findMany({
            where: {
              otp: otp,
              timestamp: { gte: today },
              influenceurs: {
                categoryId: influenceurWithCat.categoryId,
              },
              isValidated: true,
            },
            select: {
              id: true,
              isSpecial: true,
              influenceurs: {
                select: {
                  category: { select: { name: true } },
                },
              },
            },
          })
          .catch((err) => {
            console.error("Erreur vérification votes existants:", err);
            throw new Error("timeoutError");
          });

        // Logique de validation (inchangée)
        const hasNormalVote = existingVotes.some((v) => !v.isSpecial);
        const hasSpecialVote = existingVotes.some((v) => v.isSpecial);

        if (isSpecialVote) {
          if (hasSpecialVote) {
            socket.emit("voteError", politeErrorMessages.alreadyVotedSpecial);
            return;
          }
          if (!hasNormalVote) {
            socket.emit("voteError", politeErrorMessages.needNormalVoteFirst);
            return;
          }
        } else if (hasNormalVote) {
          const message = hasSpecialVote
            ? politeErrorMessages.allVotesUsed
            : politeErrorMessages.alreadyVotedCategory;
          socket.emit("voteError", message);
          return;
        }

        // Enregistrement du vote (inchangé)
        const vote = await prisma.votes
          .create({
            data: {
              influenceurId,
              phoneNumber,
              isSpecial: isSpecialVote,
              isValidated: true,
              otp: otp,
              otpExpiresAt: new Date(),
              ipAddress: clientIp,
            },
          })
          .catch((err) => {
            console.error("Erreur création vote:", err);
            throw new Error("timeoutError");
          });

        // 🚀 OPTIMISATION PRINCIPALE : Mise à jour du cache au lieu d'une requête DB
        let newVoteCount;
        const cachedData = liveVoteCache.get(influenceurId);

        if (cachedData) {
          // Incrémenter directement le cache
          cachedData.voteCount += 1;
          cachedData.lastUpdate = new Date();
          newVoteCount = cachedData.voteCount;

          console.log(
            `📊 Cache mis à jour pour ${influenceurId}: ${newVoteCount} votes`
          );
        } else {
          // Si pas en cache, faire une requête et mettre en cache
          newVoteCount = await prisma.votes.count({
            where: { influenceurId, isValidated: true },
          });

          liveVoteCache.set(influenceurId, {
            voteCount: newVoteCount,
            categoryId: influenceurWithCat.categoryId,
            lastUpdate: new Date(),
          });

          console.log(
            `📊 Nouveau cache créé pour ${influenceurId}: ${newVoteCount} votes`
          );
        }

        // Émettre la mise à jour optimisée avec flag increment
        io.emit("voteUpdate", {
          influenceurId,
          newVoteCount: newVoteCount,
          categoryId: influenceurWithCat.categoryId,
          increment: true, // Flag pour indiquer qu'c'est un incrément
          timestamp: new Date().toISOString(),
        });

        socket.emit("voteSuccess", vote);

        console.log("📢 Émission voteUpdate optimisée:", {
          influenceurId,
          newVoteCount,
          categoryId: influenceurWithCat.categoryId,
          increment: true,
        });

        // Synchronisation périodique avec la DB (optionnel, pour sécurité)
        // Seulement tous les 100 votes ou toutes les heures
        if (newVoteCount % 100 === 0) {
          setTimeout(() => syncCacheWithDB(influenceurId), 1000);
        }
      } catch (error) {
        console.error("❌ Erreur submitVote complète:", {
          error: error.message,
          stack: error.stack,
          data: { influenceurId, phoneNumber, isSpecialVote, otp },
        });
        socket.emit("voteError", "Non effectué, Veuillez réessayer plus tard.");
      }
    }
  );

  // Fonction de hash simple (à remplacer par crypto en production)
  String.prototype.hashCode = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      hash = (hash << 5) - hash + this.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  };

  /**
   * Route pour valider un vote avec OTP
   * @route POST /api/validate-vote
   * @param {string} phoneNumber - Numéro de téléphone de l'utilisateur
   * @param {string} otp - Code OTP
   * @returns {object} - Détails du vote validé
   * @throws {400} - Si le numéro de téléphone
   */
  socket.on("requestOTP", async ({ phoneNumber, influenceurId }) => {
    if (!phoneNumber || !influenceurId) {
      socket.emit("otpError", "Numéro ou influenceur manquant.");
      return;
    }

    try {
      // Récupérer l'influenceur avec sa catégorie
      const influenceur = await prisma.influenceurs.findUnique({
        where: { id: influenceurId },
        include: { category: true },
      });

      const isSpecialCategory =
        influenceur.category?.name === "INFLUENCEUR2LANNEE";

      // Vérifier les votes existants
      const existingVotes = await prisma.votes.findMany({
        where: {
          phoneNumber,
          isValidated: true, // ou false selon votre besoin
        },
        include: {
          influenceurs: {
            include: {
              category: true,
            },
          },
        },
      });

      // Correction ici: utiliser existingVotes[0] pour le vote existant
      const existingVote = existingVotes.length > 0 ? existingVotes[0] : null;

      const hasNormalVote = existingVotes.some(
        (v) => v.influenceurs?.category?.name !== "INFLUENCEUR2LANNEE"
      );

      const hasSpecialVote = existingVotes.some(
        (v) => v.influenceurs?.category?.name === "INFLUENCEUR2LANNEE"
      );

      // Logique spéciale pour INFLUENCEUR2LANNEE
      if (isSpecialCategory) {
        if (hasSpecialVote) {
          socket.emit("otpError", "Vous avez déjà utilisé votre vote spécial");
          return;
        }
        if (!hasNormalVote) {
          socket.emit(
            "otpError",
            "Vous devez d'abord voter dans une catégorie normale"
          );
          return;
        }
      } else {
        if (hasNormalVote) {
          socket.emit("offerSecondVote", { canVoteSpecial: true });
          return;
        }
      }

      // Générer un OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      console.log("📤 Tentative d'envoi WhatsApp via Twilio:", {
        to: phoneNumber,
        body: `Votre code de vérification est : ${otp}`,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
      });

      // Envoyer l'OTP via Twilio
      const twilioResponse = await twilioClient.messages.create({
        body: `Votre code de vérification est : ${otp}. Valide 5 minutes.`,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
      });

      socket.emit("otpSent", otp);
      console.log("📢 Émission Socket.IO : otpSent", otp);

      console.log("✅ Réponse Twilio:", {
        status: twilioResponse.status,
        sid: twilioResponse.sid,
        dateSent: twilioResponse.dateSent,
        errorMessage: twilioResponse.errorMessage,
      });

      // Sauvegarder en base de données
      if (existingVote) {
        await prisma.votes.update({
          where: { id: existingVote.id },
          data: {
            otp,
            otpExpiresAt,
            influenceurId,
            isSpecial: isSpecialCategory, // Mettre à jour aussi le flag isSpecial
          },
        });
      } else {
        await prisma.votes.create({
          data: {
            influenceurId,
            phoneNumber,
            otp,
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            isValidated: false,
            isSpecial: isSpecialCategory,
          },
        });
      }
    } catch (err) {
      console.error("❌ Erreur Twilio:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
        phoneNumber,
        twilioNumber: process.env.TWILIO_WHATSAPP_NUMBER,
      });

      socket.emit("otpError", "Échec d'envoi du code. Veuillez réessayer.");
    }
  });

  socket.on("addCategory", async ({ name, imageUrl }) => {
    try {
      const category = await prisma.category.create({
        data: { name, imageUrl },
      });

      io.emit("categoriesUpdate", { newCategory: category });
      socket.emit("categoryAdded", category);
    } catch (error) {
      console.error("Erreur lors de l'ajout de catégorie:", error);
      socket.emit("categoryError", "Erreur lors de l'ajout de la catégorie");
    }
  });

  /**
   * Événement pour supprimer une catégorie
   */
  socket.on("removeCategory", async (id) => {
    try {
      await prisma.category.delete({
        where: { id },
      });

      io.emit("categoriesUpdate", { deletedCategoryId: id });
      socket.emit("categoryRemoved", id);
    } catch (error) {
      console.error("Erreur lors de la suppression de catégorie:", error);
      socket.emit(
        "categoryError",
        "Erreur lors de la suppression de la catégorie"
      );
    }
  });

  /**
   * Événement pour mettre à jour une catégorie
   */
  socket.on("updateCategory", async ({ id, name, imageUrl }) => {
    try {
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { name, imageUrl },
      });

      io.emit("categoriesUpdate", { updatedCategory });
      socket.emit("categoryUpdated", updatedCategory);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de catégorie:", error);
      socket.emit(
        "categoryError",
        "Erreur lors de la mise à jour de la catégorie"
      );
    }
  });

  socket.on("updateInfluenceur", async (updatedInfluenceur) => {
    try {
      // Vérifier que la catégorie existe
      if (updatedInfluenceur.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: updatedInfluenceur.categoryId },
        });
        if (!categoryExists) {
          socket.emit("influenceurError", "Catégorie non trouvée");
          return;
        }
      }

      const result = await prisma.influenceurs.update({
        where: { id: updatedInfluenceur.id },
        data: {
          name: updatedInfluenceur.name,
          imageUrl: updatedInfluenceur.imageUrl,
          categoryId: updatedInfluenceur.categoryId,
        },
        include: {
          votes: {
            where: { isValidated: true },
          },
        },
      });

      // Formater la réponse avec voteCount
      const responseData = {
        ...result,
        voteCount: result.votes ? result.votes.length : 0,
      };

      io.emit("influenceursUpdate", { updatedInfluenceur: responseData });
    } catch (error) {
      console.error("Erreur mise à jour influenceur:", error);
      socket.emit("influenceurError", "Erreur lors de la mise à jour");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
  });
});

app.get("/api/votes", async (_req, res) => {
  try {
    const votes = await prisma.votes.findMany({
      orderBy: { timestamp: "desc" },
      take: 10, // Limite pour éviter de surcharger
    });
    res.json(votes);
  } catch (error) {
    console.error("Erreur récupération votes:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/votes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.votes.delete({
      where: { id },
    });

    // Émettre la mise à jour via Socket.IO
    io.emit("voteDeleted", { voteId: id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// Nouvelle route résultats optimisée pour WebSocket (sans cache, incrémentation côté serveur)
let liveResults = {}; // { [categoryId]: { influenceurs: [...], totalVotes, isSpecialCategory } }

// Route optimisée pour les résultats
app.get("/api/results/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const specialCategory = await prisma.category.findFirst({
      where: { name: "INFLUENCEUR2LANNEE" },
      select: { id: true },
    });

    // Récupérer les influenceurs (sans les votes pour optimiser)
    const influenceurs = await prisma.influenceurs.findMany({
      where: {
        OR: [
          { categoryId },
          ...(categoryId === specialCategory?.id ? [{ isMain: true }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        isMain: true,
        categoryId: true,
      },
    });

    const isSpecialCategory = categoryId === specialCategory?.id;

    // Utiliser le cache pour les votes au lieu de requêtes DB
    const formattedResults = influenceurs.map((inf) => {
      const cachedData = liveVoteCache.get(inf.id);
      let voteCount = 0;

      if (cachedData) {
        // Utiliser le cache
        voteCount = isSpecialCategory
          ? cachedData.specialVoteCount || 0
          : cachedData.voteCount || 0;
      } else {
        // Si pas en cache, initialiser à 0 (sera mis à jour au prochain vote)
        liveVoteCache.set(inf.id, {
          voteCount: 0,
          categoryId: inf.categoryId,
          lastUpdate: new Date(),
        });
      }

      return {
        id: inf.id,
        name: inf.name,
        imageUrl: inf.imageUrl,
        voteCount,
        isMain: inf.isMain,
      };
    });

    const totalVotes = formattedResults.reduce(
      (sum, inf) => sum + inf.voteCount,
      0
    );
    const sortedResults = formattedResults.sort(
      (a, b) => b.voteCount - a.voteCount
    );

    const results = {
      influenceurs: sortedResults,
      totalVotes,
      isSpecialCategory,
    };

    res.json(results);
  } catch (error) {
    console.error("Erreur récupération résultats:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// fonction données par claude

// Fonction de nettoyage du cache (à appeler périodiquement)
function cleanupCache() {
  const now = new Date();
  const oneHour = 60 * 60 * 1000;

  for (const [influenceurId, data] of liveVoteCache.entries()) {
    if (now.getTime() - data.lastUpdate.getTime() > oneHour) {
      // Synchroniser avec la DB avant de nettoyer
      syncCacheWithDB(influenceurId);
    }
  }
}

// Nettoyage périodique du cache (toutes les heures)
setInterval(cleanupCache, 60 * 60 * 1000);

// Initialiser le cache au démarrage du serveur
initializeVoteCache();

// fin claude function

// Incrémentation live via WebSocket (à placer dans le handler "submitVote")
function incrementLiveResults({ influenceurId, categoryId, isSpecial }) {
  if (!liveResults[categoryId]) return;
  const resObj = liveResults[categoryId];
  const idx = resObj.influenceurs.findIndex((inf) => inf.id === influenceurId);
  if (idx !== -1) {
    // Vérifier si on doit incrémenter selon la catégorie spéciale ou non
    if (
      (resObj.isSpecialCategory && isSpecial) ||
      (!resObj.isSpecialCategory && !isSpecial)
    ) {
      resObj.influenceurs[idx].voteCount += 1;
      resObj.totalVotes += 1;
      // Re-trier
      resObj.influenceurs.sort((a, b) => b.voteCount - a.voteCount);
    }
  }
}

// À placer dans le handler "submitVote" après la création du vote validé
// incrementLiveResults({ influenceurId, categoryId, isSpecial });

/*
Exemple d'utilisation dans le handler existant :
Après avoir validé le vote et émis "voteUpdate", ajoutez :
incrementLiveResults({
  influenceurId,
  categoryId: influenceurWithCat.categoryId,
  isSpecial: isSpecialVote
});
*/

// Routes pour les catégories
app.get("/api/categories", async (_req, res) => {
  try {
    const cacheKey = "categories:all";
    // Vérifier le cache Redis (30 minutes = 1800 secondes)
    const cachedCategories = await redisClient.get(cacheKey);
    if (cachedCategories) {
      console.log("Récupération des catégories depuis le cache Redis");
      return res.json(JSON.parse(cachedCategories));
    }

    // Si pas en cache, récupérer depuis la base de données
    const categories = await prisma.category.findMany();
    res.json(categories);

    // Mettre en cache pour 30 minutes
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(categories));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des catégories" });
  }
});

// Route pour créer une catégorie (remplacez la section commentée)
app.post("/api/categories", async (req, res) => {
  const { name, imageUrl } = req.body;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: "Le nom et l'image sont requis" });
  }

  try {
    const category = await prisma.category.create({
      data: { name, imageUrl },
    });

    // Émettre l'événement Socket.IO pour la mise à jour en temps réel
    io.emit("categoriesUpdate", { newCategory: category });

    await redisClient.publish(
      "categories",
      JSON.stringify({
        event: "categoriesUpdate",
        data: { newCategory: category },
      })
    );

    res.json(category);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la catégorie" });
  }
});

// Routes pour les influenceurs
// Route pour récupérer tous les influenceurs avec leur nombre de votes validés
app.get("/api/influenceurs", async (_req, res) => {
  try {
    // Récupérer tous les influenceurs et leurs votes validés
    const influenceurs = await prisma.influenceurs.findMany({
      include: {
        votes: {
          where: { isValidated: true }, // On ne compte que les votes validés
          select: { id: true }, // On ne récupère que l'id pour compter
        },
      },
    });

    // Formater la réponse pour inclure le nombre de votes
    const formattedInfluenceurs = influenceurs.map((inf) => ({
      id: inf.id,
      name: inf.name,
      imageUrl: inf.imageUrl,
      isMain: inf.isMain,
      categoryId: inf.categoryId,
      voteCount: inf.votes ? inf.votes.length : 0, // Calcul du nombre de votes validés
    }));

    res.json(formattedInfluenceurs);
  } catch (error) {
    console.error("Erreur récupération influenceurs:", error);
    res.status(500).json({ error: "Erreur serveur" });
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

    // Supprimer tous les votes liés à cet influenceur
    await prisma.votes.deleteMany({
      where: { influenceurId: id },
    });

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
  let { name, imageUrl, categoryId } = req.body;

  if (!name || !imageUrl || !categoryId) {
    return res
      .status(400)
      .json({ error: "Le nom, l'image et la catégorie sont requis" });
  }

  try {
    // Nettoyage du nom: suppression des espaces et conversion en minuscules
    const cleanedName = name.trim().toLowerCase();

    // 1. Vérifiez que la catégorie existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    // 2. Vérifiez si un influenceur avec le même nom (insensible à la casse) existe déjà
    const existingInfluenceur = await prisma.influenceurs.findFirst({
      where: {
        name: {
          equals: cleanedName,
          mode: "insensitive", // Prisma permet une comparaison insensible à la casse
        },
      },
    });

    // Alternative si la version de Prisma ne supporte pas 'mode: insensitive'
    // const allInfluenceurs = await prisma.influenceurs.findMany();
    // const existingInfluenceur = allInfluenceurs.find(inf =>
    //   inf.name.trim().toLowerCase() === cleanedName
    // );

    // 3. Déterminez la valeur de isMain
    const isMain = !existingInfluenceur;

    // 4. Créez le nouvel influenceur avec le nom original (non modifié)
    const newInfluenceur = await prisma.influenceurs.create({
      data: {
        name: name.trim(), // On garde le nom original mais sans espaces aux extrémités
        imageUrl,
        categoryId,
        isMain,
      },
    });

    // 5. Formatez la réponse
    const responseData = {
      ...newInfluenceur,
      voteCount: 0,
    };

    res.status(201).json(responseData);
    io.emit("influenceursUpdate", { newInfluenceur: responseData });
  } catch (error) {
    console.error("Erreur création influenceur:", error);
    res.status(500).json({
      error: "Erreur lors de la création de l'influenceur",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Route pour mettre à jour un influenceur
 * @route PUT /api/influenceurs/:id
 * @param {string} id - ID de l'influenceur à mettre à jour
 * @param {string} name - Nouveau nom de l'influenceur
 * @param {string} imageUrl - Nouvelle URL de l'image
 * @param {string} categoryId - Nouvelle catégorie ID
 * @returns {object} - Influenceur mis à jour
 * @throws {404} - Si l'influenceur n'est pas trouvé
 * @throws {500} - Erreur serveur lors de la mise à jour
 */
app.put("/api/influenceurs/:id", async (req, res) => {
  const { id } = req.params;
  const { name, imageUrl, categoryId } = req.body;

  try {
    // Vérifier que l'influenceur existe
    const existingInfluenceur = await prisma.influenceurs.findUnique({
      where: { id },
    });

    if (!existingInfluenceur) {
      return res.status(404).json({ error: "Influenceur non trouvé" });
    }

    // Vérifier que la catégorie existe si elle est fournie
    // Nouvelle logique: si categoryId est fournie mais n'existe pas, on la met à null
    let finalCategoryId = existingInfluenceur.categoryId;
    if (categoryId !== undefined) {
      if (categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        finalCategoryId = categoryExists ? categoryId : null;
      } else {
        finalCategoryId = null; // Si categoryId est explicitement null ou ""
      }
    }

    // Mettre à jour l'influenceur
    const updatedInfluenceur = await prisma.influenceurs.update({
      where: { id },
      data: {
        name: name || existingInfluenceur.name,
        imageUrl: imageUrl || existingInfluenceur.imageUrl,
        categoryId: finalCategoryId,
      },
      include: {
        votes: {
          where: { isValidated: true },
        },
      },
    });

    // Formater la réponse avec le voteCount
    const responseData = {
      ...updatedInfluenceur,
      voteCount: updatedInfluenceur.votes ? updatedInfluenceur.votes.length : 0,
    };

    // Émettre l'événement de mise à jour en temps réel
    io.emit("influenceursUpdate", { updatedInfluenceur: responseData });

    res.json(responseData);
  } catch (error) {
    console.error("Erreur mise à jour influenceur:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// Démarrer le serveur HTTP (pas app.listen)
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
