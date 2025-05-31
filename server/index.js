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
  transports: ["websocket", "polling"], // Ajout du polling en fallback
  pingInterval: 25000, // Ping toutes les 25 secondes
  pingTimeout: 20000, // Timeout après 20 secondes
  maxHttpBufferSize: 1e6,
  allowEIO3: true, // Compatibilité avec les anciennes versions
  // Nouvelles options pour gérer les connexions
  connectTimeout: 45000,
  forceNew: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

const blacklistedIps = new Set(['102.138.140.91','102.207.1.100','102.209.219.233','102.209.222.119','102.209.223.30','102.211.56.12','102.215.255.153','102.64.221.209','102.67.204.115','103.208.86.5','103.251.167.10','103.251.167.20','104.192.3.74','104.244.72.115','104.244.73.190','104.244.73.193','104.244.73.43','104.244.77.208','104.244.78.162','104.244.78.233','104.244.79.44','104.244.79.50','104.244.79.61','107.189.1.228','107.189.1.9','107.189.10.175','107.189.11.111','107.189.12.3','107.189.13.253','107.189.14.4','107.189.29.103','107.189.3.11','107.189.3.148','107.189.3.94','107.189.30.236','107.189.30.86','107.189.31.187','107.189.31.33','107.189.4.12','107.189.4.209','107.189.5.121','107.189.5.188','107.189.5.7','107.189.6.124','107.189.7.141','107.189.7.144','107.189.8.133','107.189.8.136','107.189.8.16','107.189.8.181','107.189.8.226','107.189.8.56','107.189.8.65','107.189.8.70','109.69.67.17','109.70.100.1','109.70.100.2','109.70.100.3','109.70.100.4','109.70.100.5','109.70.100.6','109.70.100.65','109.70.100.66','109.70.100.67','109.70.100.68','109.70.100.69','109.70.100.70','109.70.100.71','109.71.252.182','109.71.252.88','109.71.252.97','124.198.131.108','128.31.0.13','13.126.29.181','135.125.239.51','136.175.8.45','140.99.196.236','141.98.11.62','145.223.46.143','146.59.126.232','146.59.231.4','147.185.217.188','147.45.116.145','148.113.152.91','149.102.153.38','149.202.79.129','154.0.26.3','154.41.95.1','154.41.95.2','160.154.128.58','160.154.131.47','160.154.131.74','160.154.141.56','160.154.149.195','160.154.16.76','160.154.230.202','160.154.232.200','160.154.233.148','160.154.94.213','160.155.230.139','162.247.74.200','162.247.74.213','162.247.74.27','162.251.5.152','166.88.225.109','171.25.193.131','171.25.193.20','171.25.193.234','171.25.193.235','171.25.193.77','171.25.193.78','171.25.193.79','171.25.193.80','172.102.222.212','172.104.243.155','172.105.20.12','172.81.131.156','176.65.148.133','176.65.149.100','176.65.149.105','176.65.149.84','176.65.149.87','176.65.149.88','176.97.114.202','178.17.174.164','178.20.55.16','178.20.55.182','178.218.144.18','178.218.144.51','178.218.144.96','178.218.144.99','179.43.159.194','179.43.159.195','179.43.159.196','179.43.159.197','179.43.159.198','179.43.159.199','179.43.159.200','179.43.159.201','181.214.131.54','185.100.87.174','185.107.57.64','185.107.57.65','185.107.57.66','185.129.61.129','185.129.61.2','185.129.61.3','185.129.61.4','185.129.61.5','185.129.61.8','185.129.61.9','185.129.62.62','185.129.62.63','185.130.47.58','185.146.232.234','185.150.28.13','185.170.114.25','185.177.151.34','185.183.159.40','185.193.52.180','185.195.71.244','185.207.107.130','185.220.100.240','185.220.100.241','185.220.100.242','185.220.100.243','185.220.100.244','185.220.100.245','185.220.100.246','185.220.100.247','185.220.100.248','185.220.100.249','185.220.100.250','185.220.100.251','185.220.100.252','185.220.100.253','185.220.100.254','185.220.100.255','185.220.101.0','185.220.101.1','185.220.101.10','185.220.101.100','185.220.101.101','185.220.101.102','185.220.101.103','185.220.101.104','185.220.101.105','185.220.101.106','185.220.101.107','185.220.101.108','185.220.101.109','185.220.101.11','185.220.101.110','185.220.101.12','185.220.101.129','185.220.101.13','185.220.101.132','185.220.101.137','185.220.101.139','185.220.101.14','185.220.101.142','185.220.101.143','185.220.101.145','185.220.101.147','185.220.101.15','185.220.101.151','185.220.101.152','185.220.101.156','185.220.101.157','185.220.101.159','185.220.101.16','185.220.101.164','185.220.101.165','185.220.101.169','185.220.101.17','185.220.101.170','185.220.101.177','185.220.101.18','185.220.101.181','185.220.101.184','185.220.101.185','185.220.101.19','185.220.101.191','185.220.101.2','185.220.101.20','185.220.101.21','185.220.101.22','185.220.101.23','185.220.101.24','185.220.101.25','185.220.101.26','185.220.101.27','185.220.101.28','185.220.101.29','185.220.101.3','185.220.101.30','185.220.101.31','185.220.101.32','185.220.101.33','185.220.101.34','185.220.101.35','185.220.101.36','185.220.101.37','185.220.101.38','185.220.101.39','185.220.101.4','185.220.101.40','185.220.101.41','185.220.101.42','185.220.101.43','185.220.101.44','185.220.101.45','185.220.101.46','185.220.101.48','185.220.101.49','185.220.101.5','185.220.101.50','185.220.101.51','185.220.101.52','185.220.101.53','185.220.101.54','185.220.101.55','185.220.101.57','185.220.101.58','185.220.101.59','185.220.101.6','185.220.101.60','185.220.101.61','185.220.101.62','185.220.101.63','185.220.101.64','185.220.101.65','185.220.101.67','185.220.101.68','185.220.101.69','185.220.101.7','185.220.101.70','185.220.101.71','185.220.101.72','185.220.101.73','185.220.101.74','185.220.101.75','185.220.101.76','185.220.101.77','185.220.101.78','185.220.101.79','185.220.101.8','185.220.101.80','185.220.101.81','185.220.101.83','185.220.101.84','185.220.101.85','185.220.101.86','185.220.101.87','185.220.101.88','185.220.101.89','185.220.101.9','185.220.101.90','185.220.101.96','185.220.101.97','185.220.101.98','185.220.101.99','185.220.103.5','185.220.103.6','185.220.103.9','185.231.102.51','185.233.100.23','185.241.208.185','185.241.208.202','185.241.208.204','185.241.208.206','185.241.208.54','185.241.208.71','185.241.208.81','185.241.208.92','185.244.192.175','185.244.192.184','185.246.188.149','185.246.188.73','185.246.188.74','185.247.184.105','185.247.184.33','185.34.33.2','185.39.207.83','185.40.4.100','185.40.4.101','185.40.4.121','185.40.4.127','185.40.4.132','185.40.4.149','185.40.4.150','185.40.4.20','185.40.4.22','185.40.4.29','185.40.4.38','185.40.4.44','185.40.4.64','185.40.4.92','185.56.83.83','188.214.104.21','188.239.191.25','188.68.36.28','188.68.52.231','190.211.254.97','192.108.48.150','192.42.116.15','192.42.116.173','192.42.116.174','192.42.116.175','192.42.116.176','192.42.116.177','192.42.116.178','192.42.116.179','192.42.116.18','192.42.116.180','192.42.116.181','192.42.116.182','192.42.116.183','192.42.116.184','192.42.116.185','192.42.116.186','192.42.116.19','192.42.116.196','192.42.116.20','192.42.116.208','192.42.116.209','192.42.116.210','192.42.116.211','192.42.116.212','192.42.116.213','192.42.116.214','192.42.116.215','192.42.116.216','192.42.116.217','192.42.116.218','192.42.116.219','192.42.116.22','192.42.116.23','192.42.116.24','192.42.116.28','192.99.149.111','193.105.134.155','193.189.100.194','193.189.100.195','193.189.100.196','193.189.100.197','193.189.100.198','193.189.100.199','193.189.100.200','193.189.100.201','193.189.100.202','193.189.100.203','193.189.100.204','193.189.100.205','193.189.100.206','193.218.118.160','193.218.118.173','193.239.232.102','193.26.115.212','193.26.115.243','193.26.115.43','193.26.115.61','193.32.162.104','193.32.162.96','193.36.132.21','194.15.112.133','194.15.113.118','194.15.115.212','194.15.36.117','194.163.157.49','194.26.192.77','194.59.6.81','194.87.55.98','195.176.3.23','195.176.3.24','195.47.238.176','195.47.238.177','195.47.238.178','195.47.238.44','195.47.238.82','195.47.238.83','195.47.238.84','195.47.238.86','195.47.238.87','195.47.238.88','195.47.238.90','195.47.238.91','195.47.238.92','195.47.238.93','195.80.151.242','196.47.128.162','196.47.128.182','196.47.134.47','196.47.134.50','198.50.212.160','198.58.107.53','198.98.51.189','198.98.57.151','198.98.62.158','199.195.251.119','199.195.251.202','199.195.253.180','2.56.10.36','2.58.56.193','2.58.56.220','2.58.56.35','2.58.56.43','204.137.14.104','204.137.14.105','204.137.14.106','204.8.96.101','204.8.96.103','204.8.96.112','204.8.96.114','204.8.96.115','204.8.96.117','204.8.96.120','204.8.96.145','204.8.96.149','204.8.96.151','204.8.96.152','204.8.96.153','204.8.96.154','204.8.96.157','204.8.96.160','204.8.96.162','204.8.96.163','204.8.96.173','204.8.96.175','204.8.96.180','204.8.96.185','204.8.96.186','204.8.96.187','204.8.96.189','204.8.96.64','204.8.96.67','204.8.96.80','204.8.96.83','204.8.96.85','204.8.96.87','204.8.96.88','204.8.96.89','205.185.113.180','205.185.113.8','205.185.116.215','209.141.32.181','209.141.34.15','209.141.58.254','212.21.66.6','212.95.54.78','216.173.72.244','23.137.250.83','23.137.254.137','23.151.8.8','23.184.48.78','23.191.200.10','23.191.200.14','23.191.200.18','23.191.200.19','23.191.200.2','23.191.200.20','23.191.200.24','23.191.200.25','23.191.200.26','23.191.200.28','23.191.200.30','23.191.200.5','23.191.200.6','23.27.138.232','31.133.0.210','31.42.177.222','31.44.238.25','37.114.50.124','37.114.50.142','37.114.50.18','37.114.50.27','37.114.63.5','37.187.5.192','37.216.194.130','37.221.208.71','37.228.129.128','37.228.129.189','37.48.70.156','38.135.24.33','38.97.116.242','38.97.116.244','41.202.75.55','41.207.221.167','45.12.3.80','45.128.133.242','45.13.225.69','45.13.225.78','45.132.246.245','45.133.74.53','45.138.16.107','45.138.16.113','45.138.16.164','45.138.16.230','45.138.16.231','45.138.16.240','45.138.16.248','45.138.16.69','45.138.16.76','45.141.215.110','45.141.215.111','45.141.215.114','45.141.215.167','45.141.215.169','45.141.215.17','45.141.215.19','45.141.215.21','45.141.215.28','45.141.215.40','45.141.215.56','45.141.215.61','45.141.215.63','45.141.215.80','45.141.215.88','45.141.215.90','45.141.215.95','45.141.215.97','45.144.209.17','45.148.10.111','45.159.53.217','45.43.70.10','45.66.35.20','45.66.35.21','45.66.35.22','45.66.35.35','45.67.34.82','45.80.158.167','45.80.158.175','45.80.158.23','45.80.158.27','45.80.158.69','45.83.104.137','45.84.107.101','45.84.107.128','45.84.107.17','45.84.107.172','45.84.107.174','45.84.107.182','45.84.107.198','45.84.107.222','45.84.107.33','45.84.107.47','45.84.107.54','45.84.107.55','45.84.107.74','45.84.107.76','45.84.107.97','45.9.168.103','45.9.168.18','45.90.185.100','45.90.185.101','45.90.185.102','45.90.185.103','45.90.185.104','45.90.185.105','45.90.185.106','45.90.185.107','45.90.185.108','45.90.185.109','45.90.185.110','45.90.185.111','45.90.185.112','45.90.185.113','45.90.185.114','45.90.185.115','45.90.185.116','45.90.185.117','45.90.185.118','45.90.185.119','45.90.185.67','45.90.185.68','45.91.167.207','45.91.250.107','45.94.31.68','45.95.169.104','45.95.169.110','45.95.169.14','45.95.169.230','46.202.224.50','46.23.109.25','46.232.251.191','46.234.47.105','46.250.243.29','5.2.67.226','5.2.79.190','5.255.111.64','5.255.115.58','5.255.118.218','5.255.123.158','5.255.127.222','5.255.98.23','5.255.99.5','5.34.182.203','5.45.102.93','5.45.98.162','5.79.66.19','51.15.59.15','51.195.166.174','51.38.225.46','54.36.101.21','54.36.108.162','57.128.220.107','62.182.84.146','62.72.47.105','64.190.76.10','66.220.242.222','72.235.129.116','77.246.98.159','77.48.28.239','79.100.235.29','8.211.1.212','80.67.167.81','80.67.172.162','80.85.246.128','80.94.92.106','80.94.92.92','82.153.138.177','82.22.254.44','83.217.9.73','84.19.182.20','84.239.46.144','85.93.218.204','87.118.110.27','87.118.116.103','87.118.116.90','87.118.122.51','87.120.254.132','88.80.26.2','88.80.26.3','88.80.26.4','89.234.157.254','89.37.95.34','89.58.26.216','89.58.41.156','91.132.144.59','91.202.5.104','91.202.5.155','91.202.5.72','91.203.144.194','91.206.169.87','91.206.26.26','91.208.75.153','91.208.75.178','91.208.75.3','92.243.24.163','92.246.84.133','93.123.109.116','93.90.74.29','93.95.227.37','94.102.51.15','94.142.241.194','94.142.244.16','94.16.115.121','94.16.121.91','94.230.208.147','95.128.43.164','98.128.173.33','98.97.79.89','127.0.0.1','185.220.101.155','107.189.7.168','151.242.157.138','198.96.155.3','107.189.29.184']);

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
              where: { isValidated: true, isSpecial: false }, // Votes normaux
            },
          },
        },
      },
    });

    // Récupérer séparément les votes spéciaux
    for (const inf of influenceurs) {
      const specialVoteCount = await prisma.votes.count({
        where: {
          influenceurId: inf.id,
          isValidated: true,
          isSpecial: true,
        },
      });

      liveVoteCache.set(inf.id, {
        normalVoteCount: inf._count.votes,
        specialVoteCount: specialVoteCount,
        categoryId: inf.categoryId,
        lastUpdate: new Date(),
      });
    }

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

// Gestion améliorée des connexions
const activeConnections = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);

  // -----------------------------------------------

  // Enregistrer la connexion active
  activeConnections.set(socket.id, {
    socket,
    connectedAt: new Date(),
    lastActivity: new Date(),
  });

  // Heartbeat pour maintenir la connexion
  const heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit("ping");
      activeConnections.get(socket.id).lastActivity = new Date();
    } else {
      clearInterval(heartbeatInterval);
    }
  }, 30000);

  // Réponse au pong du client
  socket.on("pong", () => {
    if (activeConnections.has(socket.id)) {
      activeConnections.get(socket.id).lastActivity = new Date();
    }
  });

  // Gestion des erreurs de connexion
  socket.on("error", (error) => {
    console.error(`❌ Erreur socket ${socket.id}:`, error);
    cleanupConnection(socket.id, heartbeatInterval);
  });

  // Gestion des erreurs de connexion
  socket.on("error", (error) => {
    console.error(`❌ Erreur socket ${socket.id}:`, error);
    cleanupConnection(socket.id, heartbeatInterval);
  });

  // Gestion de la déconnexion
  socket.on("disconnect", (reason) => {
    console.log(`🔌 Client déconnecté: ${socket.id}, raison: ${reason}`);
    cleanupConnection(socket.id, heartbeatInterval);
  });

  // Gestion de la déconnexion forcée
  socket.on("disconnecting", (reason) => {
    console.log(
      `🔌 Client en cours de déconnexion: ${socket.id}, raison: ${reason}`
    );
  });

  // Fonction de nettoyage
  function cleanupConnection(socketId, interval) {
    if (interval) {
      clearInterval(interval);
    }
    activeConnections.delete(socketId);

    // Forcer la fermeture si nécessaire
    if (socket && socket.connected) {
      socket.disconnect(true);
    }
  }

  // Timeout pour les connexions inactives (30 minutes)
  const inactivityTimeout = setTimeout(() => {
    console.log(`⏱️ Déconnexion pour inactivité: ${socket.id}`);
    socket.disconnect(true);
  }, 30 * 60 * 1000);

  // Nettoyer le timeout à la déconnexion
  socket.on("disconnect", () => {
    clearTimeout(inactivityTimeout);
  });

  // -----------------------------------------------

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
      socket.emit(
            "voteError",
            "Les votes sont actuellement fermés."
          );
      return;

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

          console.log("📍 IP du client:", clientIp);

        if (blacklistedIps.has(clientIp)) {
          console.warn(`Tentative de vote depuis IP bannie : ${clientIp}`);
          socket.emit(
            "voteError",
            "Vous avez déjà voté dans cette catégorie aujourd'hui. ❗❗❗"
          );
          return;
        }

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
              // OR: [
              //   { otp: otp },
              //   { ipAddress: clientIp }
              // ],
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
          // Incrémenter le bon type de vote dans le cache
          if (isSpecialVote) {
            cachedData.specialVoteCount += 1;
            newVoteCount = cachedData.specialVoteCount;
          } else {
            cachedData.normalVoteCount += 1;
            newVoteCount = cachedData.normalVoteCount;
          }
          cachedData.lastUpdate = new Date();

          console.log(
            `📊 Cache mis à jour pour ${influenceurId}: ${newVoteCount} votes ${
              isSpecialVote ? "spéciaux" : "normaux"
            }`
          );
        } else {
          // Si pas en cache, faire une requête et mettre en cache
          const normalCount = await prisma.votes.count({
            where: { influenceurId, isValidated: true, isSpecial: false },
          });

          const specialCount = await prisma.votes.count({
            where: { influenceurId, isValidated: true, isSpecial: true },
          });

          liveVoteCache.set(influenceurId, {
            normalVoteCount: normalCount,
            specialVoteCount: specialCount,
            categoryId: influenceurWithCat.categoryId,
            lastUpdate: new Date(),
          });

          newVoteCount = isSpecialVote ? specialCount : normalCount;
          console.log(
            `📊 Nouveau cache créé pour ${influenceurId}: normal=${normalCount}, spécial=${specialCount}`
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
});

// Nettoyage périodique des connexions mortes
setInterval(() => {
  const now = new Date();
  const staleConnections = [];

  activeConnections.forEach((conn, socketId) => {
    const timeSinceLastActivity = now.getTime() - conn.lastActivity.getTime();

    // Si pas d'activité depuis 5 minutes et socket pas connecté
    if (timeSinceLastActivity > 5 * 60 * 1000 && !conn.socket.connected) {
      staleConnections.push(socketId);
    }
  });

  staleConnections.forEach((socketId) => {
    console.log(`🧹 Nettoyage connexion stagnante: ${socketId}`);
    const conn = activeConnections.get(socketId);
    if (conn && conn.socket) {
      conn.socket.disconnect(true);
    }
    activeConnections.delete(socketId);
  });

  if (staleConnections.length > 0) {
    console.log(`🧹 ${staleConnections.length} connexions nettoyées`);
  }
}, 2 * 60 * 1000); // Toutes les 2 minutes

// Gestion gracieuse de l'arrêt du serveur
process.on("SIGTERM", () => {
  console.log("📴 Arrêt gracieux du serveur...");

  // Fermer toutes les connexions Socket.IO
  activeConnections.forEach((conn, socketId) => {
    if (conn.socket && conn.socket.connected) {
      conn.socket.disconnect(true);
    }
  });

  // Fermer le serveur Socket.IO
  io.close(() => {
    console.log("✅ Socket.IO fermé");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("📴 Interruption reçue, arrêt du serveur...");

  // Même logique que SIGTERM
  activeConnections.forEach((conn, socketId) => {
    if (conn.socket && conn.socket.connected) {
      conn.socket.disconnect(true);
    }
  });

  io.close(() => {
    console.log("✅ Socket.IO fermé");
    process.exit(0);
  });
});

// Monitoring des connexions
setInterval(() => {
  console.log(`📊 Connexions actives: ${activeConnections.size}`);
}, 5 * 60 * 1000); // Toutes les 5 minutes

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
        // CORRECTION PRINCIPALE : Utiliser le bon type de vote selon la catégorie
        voteCount = isSpecialCategory
          ? cachedData.specialVoteCount || 0
          : cachedData.normalVoteCount || 0;
      } else {
        // Si pas en cache, initialiser à 0 (sera mis à jour au prochain vote)
        liveVoteCache.set(inf.id, {
          normalVoteCount: 0,
          specialVoteCount: 0,
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

async function syncCacheWithDB(influenceurId) {
  try {
    const normalCount = await prisma.votes.count({
      where: { influenceurId, isValidated: true, isSpecial: false },
    });

    const specialCount = await prisma.votes.count({
      where: { influenceurId, isValidated: true, isSpecial: true },
    });

    const cachedData = liveVoteCache.get(influenceurId);
    if (cachedData) {
      cachedData.normalVoteCount = normalCount;
      cachedData.specialVoteCount = specialCount;
      cachedData.lastUpdate = new Date();

      console.log(
        `🔄 Synchronisation cache DB pour ${influenceurId}: normal=${normalCount}, spécial=${specialCount}`
      );
    }
  } catch (error) {
    console.error(`❌ Erreur sync cache DB pour ${influenceurId}:`, error);
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
