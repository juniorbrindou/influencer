import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // await InfluenceurSeeder();
}

export async function InfluenceurSeeder() {

  const influenceurs = 
    [
      {
        name: "Jean Michel ONNIN",
        imageUrl:
          "https://th.bing.com/th/id/R.382c0929b5f5becfd795422882a9d337?rik=vKXI4y3jT2h7KQ&riu=http%3a%2f%2fwww.radiojam.biz%2fupload%2fgalerie%2fNews%2fArchive+2018%2f4-Onin.jpg&ehk=MhRb%2fNXuTJFx76OV6KwhK%2fbaUdV28CBFwOr19azWdW8%3d&risl=&pid=ImgRaw&r=0",
        // voteCount: 125,
      },
      {
        name: "braising girl",
        imageUrl:
          "https://th.bing.com/th/id/OIP.-TEMltSe7prF89IgnBzdwgAAAA?w=288&h=180&c=7&r=0&o=7&cb=iwp1&pid=1.7&rm=3",
        // voteCount: 220,
      },
      {
        name: "Marie-Paule Adjé",
        imageUrl:
          "https://www.abidjanpeople.net/wp-content/uploads/2021/08/WhatsApp-Image-2021-08-16-at-15.54.44-696x464.jpeg",
        // voteCount: 190,
      },
      {
        name: "Paul Yves Ettien",
        imageUrl:
          "https://th.bing.com/th/id/OIP.DA3TxuY5PQitxRlFypNgLgHaJQ?cb=iwp1&rs=1&pid=ImgDetMain",
        // voteCount: 175,
      },
      {
        name: "BLEU Edith Brou",
        imageUrl:
          "https://media-files.abidjan.net/qui/5318_qui_6436a6f2418ca.jpg",
        // voteCount: 160,
      },
      {
        name: "DJ TikTok",
        imageUrl:
          "https://th.bing.com/th/id/R.a2440bd3e4a68049b9deebdace6b87ff?rik=iNatujg20uc4Jw&riu=http%3a%2f%2fwww.abidjancapitaledurire.com%2fwp-content%2fuploads%2f2021%2f02%2fDJTiktok_800px.jpg&ehk=%2fYptOveSanQTX%2fzMRRfNMr97bWzf9LbrTnT9gj46XQk%3d&risl=&pid=ImgRaw&r=0",
        // voteCount: 145,
      },
      {
        name: "Jordan Evraa",
        imageUrl:
          "https://image.api.sportal365.com/process/smp-images-production/pulse.ci/05092024/d82e8c43-d23d-41c4-bcd9-04ed47110c91?operations=autocrop(1042:580)",
        // voteCount: 135,
      },
      {
        name: "Kevine Obin",
        imageUrl:
          "https://yop.l-frii.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-18-at-15.24.40.jpeg",
        // voteCount: 128,
      },
      {
        name: "Juste Crépin Gondo",
        imageUrl:
          "https://kessiya.com/wp-content/uploads/2023/07/10E7FE7D-3AB5-4B0D-998E-FFC2EB4E1243-750x899.jpeg",
        // voteCount: 198,
      },
      {
        name: "Wilfried Sant'Anna",
        imageUrl:
          "https://kessiya.com/wp-content/uploads/2023/07/68003B1E-2DB3-4205-9015-2D7C87DC9F4F-750x939.jpeg",
        // voteCount: 167,
      },
      {
        name: "Tosseta",
        imageUrl:
          "https://kessiya.com/wp-content/uploads/2023/07/D2E9EFAF-AE22-4D9A-9A2F-DF26CD408585-350x350.jpeg",
        // voteCount: 142,
      },
      {
        name: "Le Grouilleur 3.0",
        imageUrl:
          "https://kessiya.com/wp-content/uploads/2023/07/7D2BE496-7D41-4F8F-A47B-337351C9C00F-750x750.jpeg",
        // voteCount: 113,
      },
    ];
  

  // On verfifie si l'influenceur existe déjà dans la base de données avant de l'ajouter 
  for (const influenceur of influenceurs) {
    const existing = await prisma.influenceurs.findFirst({
      where: {
        name: influenceur.name, // Ici on check sur "name"
      },
    });

    // Si l'influenceur n'existe pas, on l'ajoute
    if (!existing) {
      await prisma.influenceurs.create({
        data: influenceur,
      });
      console.log(`✅ Ajouté : ${influenceur.name}`);
    } else {
      console.log(`⏩ Déjà existant : ${influenceur.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
