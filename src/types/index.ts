export interface Influenceur {
  id: string;
  name: string;
  imageUrl: string;
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