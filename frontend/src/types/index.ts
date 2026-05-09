export interface Plant {
  id: number;
  name: string;
  location: string;
  status: 'healthy' | 'warning';
  img: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  imageUrl?: string;
}

export interface SensorData {
  humidity: number;
  temperature: number;
  light: number;
}
