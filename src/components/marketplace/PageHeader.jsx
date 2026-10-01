import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageHeader({ id, en, to = '/' }) {
  return (
    <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link to={to}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="leading-tight">
          <h1 className="font-display font-bold text-foreground">{id}</h1>
          <p className="text-[0.7em] text-muted-foreground/70">{en}</p>
        </div>
      </div>
    </header>
  );
}