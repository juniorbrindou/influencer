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
const httpServer = createServer(app);

// Configuration correcte de Socket.IO avec CORS
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://influenceur2lannee.com"],
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

// Configuration de Multer (remplacez la section existante)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.isAbsolute(process.env.UPLOAD_DIR)
  ? process.env.UPLOAD_DIR
  : path.join(process.cwd(), process.env.UPLOAD_DIR);
    // const uploadDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
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
  socket.on(
    "submitVote",
    async ({ influenceurId, phoneNumber, isSpecialVote }) => {
      try {
        console.log("Socket:SubmitVote");
        console.log("Vote spécial:", isSpecialVote);

        // Récupérer la catégorie "INFLUENCEUR2LANNEE" si c'est un vote spécial
        let specialCategory = null;
        if (isSpecialVote) {
          specialCategory = await prisma.Category.findFirst({
            where: {
              name: {
                equals: "INFLUENCEUR2LANNEE",
                mode: "insensitive",
              },
            },
          });

          if (!specialCategory) {
            socket.emit("voteError", "Catégorie spéciale non trouvée");
            return;
          }
        }

        // Récupérer l'influenceur avec sa catégorie
        const influenceur = await prisma.influenceurs.findUnique({
          where: { id: influenceurId },
          include: { category: true },
        });

        if (!influenceur) {
          socket.emit("voteError", "Influenceur non trouvé");
          return;
        }

        // Vérification des votes validés existants
        const existingVotes = await prisma.votes.findMany({
          where: { phoneNumber, isValidated: true },
          include: { influenceurs: { include: { category: true } } },
        });

        const hasNormalVote = existingVotes.some((vote) => !vote.isSpecial);
        const hasSpecialVote = existingVotes.some((vote) => vote.isSpecial);

        // Vérification plus stricte pour la catégorie spéciale
        if (isSpecialVote) {
          // Pour la catégorie spéciale, vérifier si l'utilisateur a déjà voté dans une catégorie normale
          if (!hasNormalVote) {
            socket.emit(
              "voteError",
              "Vous devez d'abord voter dans une catégorie normale avant de voter dans la catégorie spéciale"
            );
            return;
          }
        } else {
          // Pour les catégories normales, vérifier si l'utilisateur a déjà voté
          if (hasNormalVote) {
            // Vérifier si l'utilisateur a déjà les deux types de votes
            if (hasNormalVote && hasSpecialVote) {
              socket.emit(
                "voteError",
                "Vous avez déjà utilisé vos deux votes possibles (un vote normal et un vote spécial)"
              );
              return;
            }
            // Si l'utilisateur a déjà voté dans une catégorie normale, lui proposer de voter dans la catégorie spéciale
            socket.emit("offerSecondVote", { canVoteSpecial: true });
            return;
          }
        }

        // Préparer les données pour la création du vote
        const voteData = {
          influenceurId,
          phoneNumber,
          isValidated: true,
          isSpecial: isSpecialVote,
          otp: isSpecialVote ? "SPECIAL" : "",
          otpExpiresAt: isSpecialVote
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(),
        };

        // Si c'est un vote spécial, on doit trouver un influenceur de la catégorie spéciale
        if (isSpecialVote) {
          voteData.influenceurId = influenceurId;
        }

        // Enregistrement du vote
        const vote = await prisma.votes.create({
          data: voteData,
        });

        // Mise à jour des résultats
        const voteCount = await prisma.votes.count({
          where: { influenceurId: voteData.influenceurId, isValidated: true },
        });

        io.emit("voteUpdate", {
          influenceurId: voteData.influenceurId,
          newVoteCount: voteCount,
        });
        socket.emit("voteSuccess", vote);
      } catch (error) {
        console.error("Erreur WebSocket vote:", error);
        socket.emit("voteError", "Erreur lors du vote: " + error.message);
      }
    }
  );

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

  /**
   * Route pour valider un vote avec OTP
   * @route POST /api/validate
   * @param {string} phoneNumber - Numéro de téléphone de l'utilisateur
   * @param {string} otp - Code OTP
   * @returns {object} - Détails du vote validé
   * @throws {400} - Si le numéro de téléphone ou l'OTP est manquant
   * @throws {500} - Erreur serveur lors de la validation du vote
   */
  socket.on("validateOTP", async ({ phoneNumber, otp }) => {
    try {
      const vote = await prisma.votes.findFirst({
        where: {
          phoneNumber,
          otp,
          isValidated: false,
          otpExpiresAt: { gte: new Date() },
        },
        include: {
          influenceurs: true, // Simplifié car vous n'utilisez pas category dans l'émission
        },
      });

      if (!vote) {
        socket.emit("validateError", "OTP invalide ou expiré");
        return;
      }

      // 1. Marquer comme validé
      await prisma.votes.update({
        where: { id: vote.id },
        data: { isValidated: true },
      });

      // 2. Calculer le nouveau nombre de votes
      const newVoteCount = await prisma.votes.count({
        where: {
          influenceurId: vote.influenceurs.id,
          isValidated: true,
        },
      });

      // 3. Émettre avec le format attendu par le frontend
      io.emit("voteUpdate", {
        influenceurId: vote.influenceurs.id,
        newVoteCount, // Maintenant présent !
      });

      console.log("------validateOTP ---->>>>> voteUpdate");
      console.log("📢 Émission Socket.IO : voteUpdate", {
        influenceurId: vote.influenceurs.id,
        newVoteCount,
      });

      socket.emit("validateSuccess");
    } catch (error) {
      socket.emit("validateError", "Erreur serveur");
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

  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
  });
});

// Routes pour les catégories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { influenceurs: true },
    });
    res.json(categories);
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

    res.json(category);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la catégorie" });
  }
});


// Routes pour les influenceurs
app.get("/api/influenceurs", async (req, res) => {
  try {
    const influenceurs = await prisma.influenceurs.findMany({
      include: {
        votes: {
          where: { isValidated: true },
        },
      },
    });

    const formattedInfluenceurs = influenceurs.map((inf) => ({
      id: inf.id,
      name: inf.name,
      imageUrl: inf.imageUrl,
      isMain: inf.isMain,
      categoryId: inf.categoryId, // Assurez-vous que cette propriété est incluse
      voteCount: inf.votes ? inf.votes.length : 0,
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
  const { name, imageUrl, categoryId } = req.body;

  if (!name || !imageUrl || !categoryId) {
    return res
      .status(400)
      .json({ error: "Le nom, l'image et la catégorie sont requis" });
  }

  try {
    // 1. Vérifiez que la catégorie existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }

    // 2. Créez l'influenceur sans inclure les votes initialement
    const newInfluenceur = await prisma.influenceurs.create({
      data: {
        name,
        imageUrl,
        categoryId,
      },
    });

    // 3. Formatez la réponse avec voteCount à 0 par défaut
    const responseData = {
      ...newInfluenceur,
      voteCount: 0, // Initialisation explicite à 0
    };

    res.status(201).json(responseData);
    io.emit("influenceursUpdate", { newInfluenceur: responseData });
  } catch (error) {
    console.error("Erreur création influenceur:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'influenceur" });
  }
});

// Démarrer le serveur HTTP (pas app.listen)
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, "localhost", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
