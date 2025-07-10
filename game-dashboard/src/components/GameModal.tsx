import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Game } from "./GameCard";
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Gamepad2, 
  DollarSign, 
  AlertTriangle,
  PlayCircle,
  Heart,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onAddAlert: (game: Game) => void;
}

export function GameModal({ game, isOpen, onClose, onAddAlert }: GameModalProps) {
  if (!game) return null;

  const getRTPColor = (rtp: number) => {
    if (rtp >= 97) return 'text-success';
    if (rtp >= 95) return 'text-warning';
    return 'text-destructive';
  };

  const getRTPProgress = (rtp: number) => {
    return ((rtp - 85) / (100 - 85)) * 100;
  };

  const getVarianceColor = (variance: string) => {
    switch (variance) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text">
            {game.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Image and Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="lg" className="bg-primary/90 hover:bg-primary backdrop-blur-sm">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Jogar Agora
                </Button>
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {game.isHot && (
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500">
                    🔥 HOT
                  </Badge>
                )}
                {game.isNew && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                    ✨ NEW
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Provider */}
              <div>
                <p className="text-sm text-muted-foreground">Provedor</p>
                <p className="font-semibold text-lg">{game.provider}</p>
              </div>

              {/* Category */}
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <Badge variant="secondary" className="mt-1">
                  {game.category}
                </Badge>
              </div>

              {/* Last Updated */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Atualizado: {game.lastUpdated}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAddAlert(game)}
                  className="flex-1"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Criar Alerta
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* RTP Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Return to Player (RTP)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-card border">
                <div className={cn("text-3xl font-bold", getRTPColor(game.rtp))}>
                  {game.rtp}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">RTP Atual</p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Desempenho RTP</span>
                  <span className={getRTPColor(game.rtp)}>
                    {game.rtp >= 97 ? 'Excelente' : game.rtp >= 95 ? 'Bom' : 'Baixo'}
                  </span>
                </div>
                <Progress 
                  value={getRTPProgress(game.rtp)} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>85%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Game Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              Estatísticas do Jogo
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-semibold">Volatilidade</div>
                <div className={cn("text-sm capitalize", getVarianceColor(game.variance))}>
                  {game.variance}
                </div>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/50">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-gold" />
                <div className="font-semibold">Ganho Máximo</div>
                <div className="text-sm text-gold font-bold">{game.maxWin}</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className={cn(
                  "w-6 h-6 mx-auto mb-2 rounded-full",
                  game.priority === 'high' && "bg-success",
                  game.priority === 'medium' && "bg-warning",
                  game.priority === 'low' && "bg-destructive"
                )} />
                <div className="font-semibold">Prioridade</div>
                <div className="text-sm capitalize">{game.priority}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Analysis */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Análise</h3>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-sm leading-relaxed">
                Este jogo apresenta um RTP de <span className={cn("font-semibold", getRTPColor(game.rtp))}>{game.rtp}%</span> com 
                volatilidade <span className={cn("font-semibold capitalize", getVarianceColor(game.variance))}>{game.variance}</span>. 
                {game.rtp >= 97 && " Excelente retorno ao jogador, recomendado para sessões longas."}
                {game.rtp >= 95 && game.rtp < 97 && " Bom retorno ao jogador, adequado para a maioria dos jogadores."}
                {game.rtp < 95 && " RTP abaixo da média, considere outros jogos para melhores retornos."}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}