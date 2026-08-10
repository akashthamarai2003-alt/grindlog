export interface CoachSession {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface CoachResponse {
  message: string;
  tone: "supportive" | "motivational" | "informative";
  recommendations: string[];
  warnings: string[];
}
