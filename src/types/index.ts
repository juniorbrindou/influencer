export interface Influenceur {
  id: string;
  name: string;
  imageUrl: string | File;
  categoryId: string;
  category?: Category;
  voteCount: number;
}

export interface Vote {
  influenceurId: string;
  phoneNumber: string;
  timestamp: number;
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