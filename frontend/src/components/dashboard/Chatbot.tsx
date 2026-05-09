import React, { useState, useRef } from 'react';
import { Send, Bot, User, Loader2, X, Camera, Paperclip, Info } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChatMessage } from '@/types';

export function Chatbot() {
  const [chatMessage, setChatMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatMessage.trim() && !selectedFile) return;

    const userMsgText = chatMessage;
    const currentPreviewUrl = previewUrl;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsgText,
      imageUrl: currentPreviewUrl || undefined
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setChatMessage('');
    clearFile();
    setIsSendingMsg(true);

    try {
      const formData = new FormData();
      if (userMsgText) formData.append('message', userMsgText);
      if (selectedFile) formData.append('image', selectedFile);

      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: data.reply
        };
        setChatHistory(prev => [...prev, botMsg]);
      } else {
        throw new Error("Error en la respuesta");
      }
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: "Hubo un error de conexión con Gemini. Asegúrate de tener el backend corriendo y las API keys configuradas."
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsSendingMsg(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      {chatHistory.length > 0 && (
        <Card className="border-emerald-100 shadow-sm mt-6">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-border">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Bot className="w-5 h-5 text-emerald-600" /> Diagnóstico Detallado (Chat)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "flex gap-3 max-w-[80%]",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <Avatar className="w-8 h-8 shrink-0 border border-slate-200">
                    {msg.role === 'user' ? (
                      <div className="bg-slate-100 w-full h-full flex items-center justify-center"><User className="w-4 h-4 text-slate-600" /></div>
                    ) : (
                      <div className="bg-emerald-100 w-full h-full flex items-center justify-center"><Bot className="w-4 h-4 text-emerald-600" /></div>
                    )}
                  </Avatar>
                  <div className={cn(
                    "flex flex-col gap-2 rounded-2xl px-4 py-3 text-sm",
                    msg.role === 'user'
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-200 shadow-sm text-slate-700 rounded-tl-none"
                  )}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Subida" className="w-full max-w-[200px] rounded-lg object-cover" />
                    )}
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  </div>
                </div>
              </div>
            ))}
            {isSendingMsg && (
              <div className="flex w-full justify-start">
                <div className="flex gap-3 max-w-[80%] flex-row">
                  <Avatar className="w-8 h-8 shrink-0 border border-slate-200">
                    <div className="bg-emerald-100 w-full h-full flex items-center justify-center"><Bot className="w-4 h-4 text-emerald-600" /></div>
                  </Avatar>
                  <div className="bg-white border border-slate-200 shadow-sm text-slate-700 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Analizando anomalías...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>
      )}

      {/* CHATBOT INPUT (Fijo abajo) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">

          {previewUrl && (
            <div className="mb-2 relative inline-block">
              <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border-2 border-emerald-500 shadow-sm" />
              <button onClick={clearFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn("shrink-0 rounded-full h-12 w-12", selectedFile ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-slate-300")}
                >
                  <Camera className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sube foto de hojas/plagas</TooltipContent>
            </Tooltip>

            <div className="flex-1 flex items-center bg-muted/30 border border-slate-200 rounded-full pr-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all h-12 shadow-sm">
              <Input
                type="text"
                placeholder="Escribe 'Analiza esta foto' o pregúntale a Gemini sobre plagas..."
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent h-full px-4 text-base"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={isSendingMsg}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isSendingMsg || (!chatMessage.trim() && !selectedFile)}
                className={cn("rounded-full h-9 w-9 transition-all", (chatMessage.trim().length > 0 || selectedFile) ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" : "bg-slate-200 text-slate-400")}
              >
                {isSendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </form>
          <div className="text-center flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-medium">
            <Info className="w-3 h-3" />
            <span>Gemini puede cometer errores botánicos. Verifica la información.</span>
          </div>
        </div>
      </div>
    </>
  );
}
