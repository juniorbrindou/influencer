import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await InfluenceurSeeder();
}

export async function InfluenceurSeeder() {

  const influenceurs = 
    [
      {
        name: "Jean Michel ONNIN",
        imageUrl:
          "https://scontent.fabj2-1.fna.fbcdn.net/v/t39.30808-6/321971571_556278652753819_7172227098506846649_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGLnakWWZrsXZ9FqwrNEF9or2a0Rc4fe0mvZrRFzh97SevAFGHuPUfYAY25UMta7XpM2JsU0rrWSCht4DwQEI4x&_nc_ohc=WYwUrr4iSD8Q7kNvwF8IxiE&_nc_oc=AdkcBwv8IygY3Bb701HBR1eIOa_s5LzLcI2BVZlBK238E2LRePLGXZBBSfV6shYIM1s&_nc_zt=23&_nc_ht=scontent.fabj2-1.fna&_nc_gid=bcB67O5OMwGrx4g1gqshTA&oh=00_AfFyxCQIDi8d2NgRhPhWzboiQVqiFwms6XfhErWvpv8xWg&oe=6811A51F",
        // voteCount: 125,
      },
      {
        name: "Lala Fatima Haidara (La gouteuse)",
        imageUrl:
          "https://scontent.fabj2-1.fna.fbcdn.net/v/t39.30808-6/345475120_623989789746921_6838809150239647602_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHXtUXR9Da8PZ-1fK5UQpTsYqL6PMB8EMFiovo8wHwQwXQZOgbmYCmjmdZ389dGUOVvzc3YE-zzYy3E8Ezrbr2K&_nc_ohc=kiwGWkaX_fQQ7kNvwELDDS9&_nc_oc=Adk21-ZaTcm84VI40eROuzkIJ4ldiPB_mIVU70DKfInW77XyJ-0a6VzhMx3WxN87t3o&_nc_zt=23&_nc_ht=scontent.fabj2-1.fna&_nc_gid=GrN0qPw39Ajd5Q6xhhT_pg&oh=00_AfFXYVHCtToXpRjvT9xvs1q_Ry-r0DWRd1fgcpbRhM12Ow&oe=68118F3F",
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
          "https://scontent.fabj2-1.fna.fbcdn.net/v/t39.30808-6/368822965_880323576824041_9050352684898834596_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGeAQU_xoHkRZRtnJvt63gjj-IxlkuSO0WP4jGWS5I7Rfp7O4hUNn1ozVRBlCPDNI22eWz_W5opaQNzB18XeHxK&_nc_ohc=PaMnUSXcgcwQ7kNvwEz9esj&_nc_oc=AdnWRY4HzLQmVPgeF76GxmXSgBphxDbnfU2hR-R23nf5LAS9d9HWRz_L8Dm4RBQXiCI&_nc_zt=23&_nc_ht=scontent.fabj2-1.fna&_nc_gid=xFMnyDAGViDBYktSl_whcg&oh=00_AfHZHRiBPXlWTOVzfRyOWVIZu8J4lsmJs3XA4iaF54e3pQ&oe=68119051",
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
          "https://kessiya.com/wp-content/uploads/2023/07/08D7D64D-D09E-45CE-AD51-E889566DD509-750x939.jpeg",
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
