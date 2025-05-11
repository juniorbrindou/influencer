export interface Influenceur {
  id: string;
  name: string;
  imageUrl: string | File;
  categoryId: string;
  category?: Category;
  voteCount: number;
  isMain: boolean
}

export interface Vote {
  id: string;
  influenceurId: string;
  phoneNumber: string;
  timestamp: number;
  isSpecial: boolean;
  isValidated: boolean;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl: string | File;
  influenceurs?: Influenceur[];
}

export interface ClassementData {
  influenceurs: Array<{
    id: string;
    name: string;
    imageUrl: string;
    voteCount: number;
    isMain?: boolean; // Optionnel selon vos besoins
  }>;
  totalVotes: number;
  isSpecialCategory: boolean;
}