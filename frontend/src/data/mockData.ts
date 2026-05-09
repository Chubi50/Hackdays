import type { Plant } from '../types';

export const mockHistoryData = [
  { time: '08:00', humidity: 40, temp: 22, light: 300 },
  { time: '10:00', humidity: 38, temp: 24, light: 600 },
  { time: '12:00', humidity: 35, temp: 26, light: 900 },
  { time: '14:00', humidity: 34, temp: 27, light: 950 },
  { time: '16:00', humidity: 36, temp: 25, light: 700 },
  { time: '18:00', humidity: 42, temp: 23, light: 400 },
  { time: '20:00', humidity: 45, temp: 21, light: 100 },
];

export const mockPlants: Plant[] = [
  { id: 1, name: 'Ficus Lyrata', location: 'Sala de estar', status: 'healthy', img: 'https://images.unsplash.com/photo-1597055181300-e3633a207517?w=800&q=80' },
  { id: 2, name: 'Monstera Deliciosa', location: 'Oficina', status: 'warning', img: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80' },
];
