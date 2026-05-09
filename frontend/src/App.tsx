import React, { useState, useEffect } from 'react';
import { Droplets, ThermometerSun, Sun, Bot, MapPin, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { mockPlants } from '@/data/mockData';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SensorCharts } from '@/components/dashboard/SensorCharts';
import { Chatbot } from '@/components/dashboard/Chatbot';

export default function App() {
  const [activePlantId, setActivePlantId] = useState(1);
  const activePlant = mockPlants.find(p => p.id === activePlantId);

  // --- STATES ---
  const [sensorData, setSensorData] = useState({ humidity: 45, temperature: 24, light: 850 });
  const [aiSummary, setAiSummary] = useState("Cargando análisis de Gemini...");
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // --- API CALLS ---
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('http://localhost:3000/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.humidity > 0) {
          setSensorData({
            humidity: data.data.humidity,
            temperature: data.data.temperature,
            light: data.data.light
          });
        }
        if (data.summary) {
          setAiSummary(data.summary);
        }
      } else {
        setAiSummary("Ocurrió un error en el servidor (CORS o DB). Revisa la consola o asegúrate de que la DB existe.");
      }
    } catch (error) {
      console.error("Error conectando al backend (Status):", error);
      setAiSummary("No se pudo conectar con la API de Gemini. ¿Está corriendo el backend?");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar activePlantId={activePlantId} setActivePlantId={setActivePlantId} />

        <main className="flex-1 flex flex-col min-h-screen bg-slate-50/50 relative overflow-hidden">
          
          <header className="h-14 border-b border-border bg-background flex items-center px-4 sticky top-0 z-10 gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <h1 className="font-semibold text-foreground flex items-center gap-2">
               {activePlant?.name}
            </h1>
            <Badge variant="outline" className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-200">
              Conectado al ESP32
            </Badge>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 pb-40">
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* COMPONENTE 1: RESUMEN GEMINI & KPIS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 overflow-hidden flex flex-col shadow-sm">
                  <div className="h-48 w-full bg-muted relative">
                    <img src={activePlant?.img} alt={activePlant?.name} className="w-full h-full object-cover" />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xl">{activePlant?.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {activePlant?.location}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="col-span-1 lg:col-span-2 flex flex-col bg-indigo-50/30 border-indigo-100">
                  <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-700">
                          <Bot className="w-5 h-5" />
                          <CardTitle className="text-lg">Análisis General - Gemini</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={isLoadingStatus}>
                          {isLoadingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar"}
                        </Button>
                      </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                      <div className="bg-white/80 p-4 rounded-xl border border-indigo-100/50 h-full shadow-sm text-slate-700 text-sm leading-relaxed relative">
                        {isLoadingStatus ? (
                          <div className="flex items-center justify-center h-full gap-2 text-indigo-400">
                            <Loader2 className="w-5 h-5 animate-spin" /> Procesando con Gemini...
                          </div>
                        ) : (
                          <p>{aiSummary}</p>
                        )}
                      </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard title="Humedad" value={`${sensorData.humidity}%`} icon={<Droplets className="w-5 h-5 text-blue-500" />} />
                <KpiCard title="Temperatura" value={`${sensorData.temperature}°C`} icon={<ThermometerSun className="w-5 h-5 text-orange-500" />} />
                <KpiCard title="Luz" value={`${sensorData.light} lx`} icon={<Sun className="w-5 h-5 text-yellow-500" />} />
              </div>

              {/* GRÁFICAS */}
              <SensorCharts />
              
              {/* CHATBOT */}
              <Chatbot />
              
            </div>
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
