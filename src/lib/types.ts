export interface User {
  id: number;
  username: string;
  email: string | null;
  password: string;
  is_admin: number;
  created_at: string;
}

export interface Stream {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  is_live: number;
  created_by: number;
  username?: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  stream_id: number;
  user_id: number;
  username?: string;
  message: string;
  is_admin?: number;
  created_at: string;
}

export interface UFCEvent {
  id: string;
  name: string;
  date: string;
  venue?: string;
  location?: string;
  mainEvent?: string;
  fighter1?: string;
  fighter2?: string;
  weightClass?: string;
  status?: string;
  fights?: Fight[];
}

export interface Fight {
  id: string;
  fighter1: string;
  fighter2: string;
  fighter1Record?: string;
  fighter2Record?: string;
  fighter1Img?: string;
  fighter2Img?: string;
  weightClass?: string;
  round?: string;
  result?: string;
}

export interface Fighter {
  id: string;
  name: string;
  nickname?: string;
  record?: string;
  height?: string;
  weight?: string;
  reach?: string;
  stance?: string;
  age?: number;
  country?: string;
  flag?: string;
  image?: string;
  weightClass?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  date: string;
  source?: string;
  url?: string;
}

export interface Replay {
  id: number;
  fighter1: string;
  fighter2: string;
  fighter1_img: string | null;
  fighter2_img: string | null;
  event: string;
  video_url: string;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  created_by: number;
  created_at: string;
  expires_at: string | null;
  is_active: number;
  dismissible: number;
  persistent: number;
  duration_minutes: number | null;
}

export interface Ranking {
  rank: number;
  fighter: string;
  record: string;
  weightClass: string;
}
