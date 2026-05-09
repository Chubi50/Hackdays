import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export function KpiCard({ title, value, icon }: KpiCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <h4 className="text-2xl font-bold tracking-tight text-foreground">{value}</h4>
        </div>
        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200/60 shadow-inner">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
