export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  voteCount: number;
}

export interface Vote {
  artistId: string;
  phoneNumber: string;
  timestamp: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}