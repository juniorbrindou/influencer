import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

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

const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier téléchargé" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Servir les fichiers statiques
app.use("/uploads", express.static("public/uploads"));

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
  socket.on("submitVote", async ({ influenceurId, phoneNumber }) => {
    try {
      const existingVote = await prisma.votes.findFirst({
        where: { phoneNumber },
      });

      if (existingVote) {
        socket.emit("voteError", "Vous avez déjà voté.");
        return;
      }

      const vote = await prisma.votes.create({
        data: { influenceurId, phoneNumber, timestamp: new Date() },
      });

      const updatedInfluenceur = await prisma.influenceurs.findUnique({
        where: { id: influenceurId },
        include: { votes: true },
      });

      io.emit("voteUpdate", {
        influenceurId,
        newVoteCount: updatedInfluenceur.votes.length,
      });

      socket.emit("voteSuccess", vote);
    } catch (error) {
      console.error("Erreur WebSocket vote:", error);
      socket.emit("voteError", "Erreur lors du vote.");
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
  socket.on("requestOTP", async ({ phoneNumber, influenceurId }) => {
    if (!phoneNumber || !influenceurId) {
      socket.emit("otpError", "Numéro ou influenceur manquant.");
      return;
    }

    try {
      // 1. Vérifier d'abord s'il existe un vote validé
      const existingVote = await prisma.votes.findFirst({
        where: { phoneNumber },
      });

      // 2. Si vote déjà validé → erreur
      if (existingVote?.isValidated) {
        socket.emit("otpResponse", { hasVoted: true });
        return;
      }

      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // 3. Cas où un OTP existe mais n'est pas validé
      if (existingVote && !existingVote.isValidated) {
        // Vérifier si l'OTP existant est encore valide
        const isOtpStillValid = existingVote.otpExpiresAt > new Date();

        const otpToSend = isOtpStillValid
          ? existingVote.otp
          : Math.floor(100000 + Math.random() * 900000).toString();

        // Mettre à jour l'enregistrement
        await prisma.votes.update({
          where: { id: existingVote.id },
          data: {
            otp: otpToSend,
            otpExpiresAt,
            influenceurId, // Au cas où l'influenceur change
          },
        });

        console.log(
          `📲 OTP ${
            isOtpStillValid ? "existant" : "regénéré"
          } pour ${phoneNumber}: ${otpToSend}`
        );
        socket.emit("otpSent", otpToSend);
        socket.emit("otpResponse", { hasVoted: false, otp: otpToSend });
        return;
      }

      // 4. Cas où aucun enregistrement n'existe pas → création
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

      await prisma.votes.create({
        data: {
          influenceurId,
          phoneNumber,
          otp: newOtp,
          otpExpiresAt,
          isValidated: false,
        },
      });

      console.log(`📲 Nouvel OTP pour ${phoneNumber}: ${newOtp}`);
      socket.emit("otpSent", newOtp);
      socket.emit("otpResponse", { hasVoted: false, otp: newOtp });
      return;
    } catch (err) {
      console.error("Erreur OTP:", err);
      socket.emit("otpError", "Erreur d'envoi OTP");
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
    if (!phoneNumber || !otp) {
      socket.emit("validateError", "Numéro ou OTP manquant.");
      return;
    }

    try {
      const vote = await prisma.votes.findFirst({
        where: {
          phoneNumber,
          otp,
          isValidated: false,
          otpExpiresAt: {
            gte: new Date(), // OTP encore valide
          },
        },
      });

      if (!vote) {
        socket.emit("validateError", "OTP invalide ou expiré.");
        return;
      }
      const updatedVote = await prisma.votes.update({
        where: { id: vote.id },
        data: { isValidated: true },
      });
      socket.emit("validateSuccess", updatedVote);
      // 🚀 Emit une mise à jour en temps réel si besoin :
      io.emit("voteValidated", {
        influenceurId: updatedVote.influenceurId,
      });
    } catch (err) {
      console.error("Erreur validation WebSocket:", err);
      socket.emit("validateError", "Erreur serveur.");
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

// app.post("/api/categories", async (req, res) => {
//   const { name } = req.body;
//   try {
//     const category = await prisma.category.create({
//       data: { name },
//     });
//     res.json(category);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Erreur lors de la création de la catégorie" });
//   }
// });

// app.delete("/api/categories/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await prisma.category.delete({
//       where: { id },
//     });
//     res.json({ message: "Catégorie supprimée avec succès" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Erreur lors de la suppression de la catégorie" });
//   }
// });

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
      categoryId: inf.categoryId,
      voteCount: inf.votes ? inf.votes.length : 0, // Sécurité supplémentaire
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
