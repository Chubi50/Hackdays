import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración de Multer para recibir imágenes en memoria (sin guardarlas en disco)
const upload = multer({ storage: multer.memoryStorage() });

// Configuración de la Base de Datos (Aiven MySQL)
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL as string,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Inicialización del nuevo SDK de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// -------------------------
// ENDPOINTS
// -------------------------

// 1. ESP32 -> Enviar datos de los sensores
app.post('/api/sensor-data', async (req, res) => {
    try {
        const { humidity, temperature, light, id_planta = 1 } = req.body;
        await pool.query(
            'INSERT INTO Condiciones_Planta (ID_planta, Humedad_tierra, temperatura_aire, luz) VALUES (?, ?, ?, ?)',
            [id_planta, humidity, temperature, light]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar los datos del sensor' });
    }
});

// 2. WebApp -> Obtener estado general
app.get('/api/status', async (req, res) => {
  try {
    // 1. Obtener la fecha más reciente en la base de datos
    const [maxDateRows] = await pool.query('SELECT MAX(fecha_medicion) as max_date FROM Condiciones_Planta');
    const maxDate = (maxDateRows as any[])[0]?.max_date;

    let dataPoints: any[] = [];
    if (maxDate) {
        // 2. Extraer los datos de las 8 horas previas a ese último registro
        const [rows] = await pool.query(
            'SELECT Humedad_tierra, temperatura_aire, luz, fecha_medicion FROM Condiciones_Planta WHERE fecha_medicion >= ? - INTERVAL 8 HOUR ORDER BY fecha_medicion ASC',
            [maxDate]
        );
        dataPoints = rows as any[];
    }
    
    let latestData = { humidity: 0, temperature: 0, light: 0 };
    let trendText = "No hay datos en la base de datos.";

    if (dataPoints.length > 0) {
        const lastRow = dataPoints[dataPoints.length - 1];
        latestData = { humidity: lastRow.Humedad_tierra, temperature: lastRow.temperatura_aire, light: lastRow.luz };
        
        // Formatear la lista de datos para Gemini
        trendText = dataPoints.map(d => `[${new Date(d.fecha_medicion).toLocaleTimeString()}] Humedad: ${d.Humedad_tierra}%, Temp: ${d.temperatura_aire}°C, Luz: ${d.luz}lx`).join('\\n');
    }
    
    // Pedir el resumen a Gemini con las últimas 8 horas
    const prompt = `Actúa como un experto botánico. A continuación tienes el historial de sensores de un periodo de 8 horas de la planta:\n\n${trendText}\n\nGenera un análisis crítico y muy directo (max 3 oraciones) sobre la evolución del estado de la planta en este periodo y qué necesita urgentemente.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    res.json({
        data: latestData,
        summary: response.text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el estado' });
  }
});

// 3. WebApp -> Chatbot (Texto y/o Imagen)
app.post('/api/chat', upload.single('image'), async (req, res) => {
    try {
        const userMessage = req.body.message || "Analiza el estado de la planta.";
        
        // --- OBTENER HISTORIAL DE SENSORES PARA EL CHATBOT ---
        const [maxDateRows] = await pool.query('SELECT MAX(fecha_medicion) as max_date FROM Condiciones_Planta');
        const maxDate = (maxDateRows as any[])[0]?.max_date;

        let trendText = "No hay datos de sensores.";
        if (maxDate) {
            const [rows] = await pool.query(
                'SELECT Humedad_tierra, temperatura_aire, luz, fecha_medicion FROM Condiciones_Planta WHERE fecha_medicion >= ? - INTERVAL 8 HOUR ORDER BY fecha_medicion ASC',
                [maxDate]
            );
            const dataPoints = rows as any[];
            if (dataPoints.length > 0) {
                trendText = dataPoints.map(d => `[${new Date(d.fecha_medicion).toLocaleTimeString()}] Humedad: ${d.Humedad_tierra}%, Temp: ${d.temperatura_aire}°C, Luz: ${d.luz}lx`).join('\\n');
            }
        }
        
        const systemPrompt = `Actúa como un experto botánico crítico. Analiza la imagen de la planta (si se adjuntó) buscando anomalías visuales (hojas feas, plagas, color). Además, aquí tienes el historial de sensores de las últimas 8 horas:\n\n${trendText}\n\nDiagnostica combinando la imagen y los datos de los sensores. Responde a la siguiente consulta del usuario:`;
        
        const contents: any[] = [systemPrompt + "\\n\\n" + userMessage];

        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            contents.push({ inlineData: { data: base64Image, mimeType: req.file.mimetype } });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents
        });

        res.json({ reply: response.text });
    } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Error en el Chatbot de Gemini' });
    }
});

app.listen(port, () => {
  console.log(`✅ PlantBot Backend corriendo en http://localhost:${port}`);
});
