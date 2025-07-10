import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Game {
  id: string;
  name: string;
  imageUrl: string;
  rtp: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  provider: string;
  lastUpdated: string;
  isHot?: boolean;
  isNew?: boolean;
  variance: 'high' | 'medium' | 'low';
  maxWin: string;
}

interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
  isInAlert?: boolean;
}

export function GameCard({ game, onClick, isInAlert }: GameCardProps) {
  const getRTPBadgeVariant = (rtp: number) => {
    if (rtp >= 97) return 'rtp-high';
    if (rtp >= 95) return 'rtp-medium';
    return 'rtp-low';
  };

  const getRTPColor = (rtp: number) => {
    if (rtp >= 97) return 'text-success';
    if (rtp >= 95) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="game-card group cursor-pointer" onClick={() => onClick(game)}>
      {/* Game Image */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <img
          src={game.imageUrl}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Priority Indicator */}
        <div className="absolute top-2 left-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            game.priority === 'high' && "bg-success shadow-[0_0_10px_hsl(var(--success)/0.5)]",
            game.priority === 'medium' && "bg-warning shadow-[0_0_10px_hsl(var(--warning)/0.5)]",
            game.priority === 'low' && "bg-destructive shadow-[0_0_10px_hsl(var(--destructive)/0.5)]"
          )} />
        </div>

        {/* Hot/New Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {game.isHot && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-xs">
              🔥 HOT
            </Badge>
          )}
          {game.isNew && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs">
              ✨ NEW
            </Badge>
          )}
        </div>

        {/* Alert Indicator */}
        {isInAlert && (
          <div className="absolute bottom-2 right-2">
            <AlertCircle className="w-5 h-5 text-primary animate-pulse" />
          </div>
        )}

        {/* RTP Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className={cn(
            "font-bold text-xs px-2 py-1",
            getRTPBadgeVariant(game.rtp)
          )}>
            RTP {game.rtp}%
          </Badge>
        </div>
      </div>

      {/* Game Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {game.name}
          </h3>
          <p className="text-xs text-muted-foreground">{game.provider}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span className="text-muted-foreground">RTP:</span>
            <span className={getRTPColor(game.rtp)}>{game.rtp}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span className="text-muted-foreground">Var:</span>
            <span className="capitalize">{game.variance}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs">
            <span className="text-muted-foreground">Max Win:</span>
            <span className="ml-1 font-semibold text-gold">{game.maxWin}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{game.lastUpdated}</span>
          </div>
        </div>

        <Button 
          size="sm" 
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Ver Detalhes
        </Button>
      </div>
    </Card>
  );
}