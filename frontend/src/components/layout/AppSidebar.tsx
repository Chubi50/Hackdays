import React from 'react';
import { Leaf, MapPin, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarRail,
  SidebarFooter
} from "@/components/ui/sidebar";
import { mockPlants } from '@/data/mockData';

interface AppSidebarProps {
  activePlantId: number;
  setActivePlantId: (id: number) => void;
}

export function AppSidebar({ activePlantId, setActivePlantId }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border py-4 px-4">
        <div className="flex items-center gap-2 font-bold text-lg text-emerald-700">
          <div className="bg-emerald-100 p-1.5 rounded-md">
            <Leaf className="w-5 h-5" />
          </div>
          <span>PlantBot OS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tus Plantas Registradas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mockPlants.map((plant) => (
                <SidebarMenuItem key={plant.id}>
                  <SidebarMenuButton 
                    isActive={activePlantId === plant.id}
                    onClick={() => setActivePlantId(plant.id)}
                    className="h-12"
                  >
                    <Avatar className="w-6 h-6 border border-border mr-2">
                      <AvatarImage src={plant.img} alt={plant.name} />
                      <AvatarFallback>{plant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 truncate">
                      <span className="font-medium text-sm leading-tight">{plant.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {plant.location}
                      </span>
                    </div>
                    <div className={cn("w-2 h-2 rounded-full", plant.status === 'healthy' ? "bg-emerald-500" : "bg-amber-500")} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
