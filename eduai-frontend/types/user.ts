// types/user.ts

// 1. Your Application User Interface (CamelCase for Frontend)
export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    
    // New Fields
    tokensRemaining: number;
    streakCount: number;
    lastActivityDate: string | null; // YYYY-MM-DD
  }
  
  // 2. API Response Interface (Snake_case matches FastAPI backend)
  export interface GenerateApiResponse {
    image_url: string;
    tokens_remaining: number;
    streak_count: number;
    message: string;
  }