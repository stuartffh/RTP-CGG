import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Bell, X, Plus, Settings } from "lucide-react";
import { Game } from "./GameCard";

export interface GameAlert {
  id: string;
  gameId: string;
  gameName: string;
  targetRTP: number;
  isActive: boolean;
  createdAt: string;
}

interface AlertsPanelProps {
  alerts: GameAlert[];
  onAddAlert: (gameId: string, gameName: string, targetRTP: number) => void;
  onRemoveAlert: (alertId: string) => void;
  onToggleAlert: (alertId: string) => void;
  games: Game[];
}

export function AlertsPanel({ alerts, onAddAlert, onRemoveAlert, onToggleAlert, games }: AlertsPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [targetRTP, setTargetRTP] = useState("");

  const activeAlerts = alerts.filter(alert => alert.isActive);

  const handleAddAlert = () => {
    if (selectedGameId && targetRTP) {
      const game = games.find(g => g.id === selectedGameId);
      if (game) {
        onAddAlert(selectedGameId, game.name, Number(targetRTP));
        setSelectedGameId("");
        setTargetRTP("");
        setIsDialogOpen(false);
      }
    }
  };

  const getAlertStatus = (alert: GameAlert) => {
    const game = games.find(g => g.id === alert.gameId);
    if (!game) return null;
    
    const isTriggered = game.rtp >= alert.targetRTP;
    return {
      isTriggered,
      currentRTP: game.rtp,
      difference: game.rtp - alert.targetRTP
    };
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Alertas RTP</h3>
          {activeAlerts.length > 0 && (
            <Badge variant="secondary">
              {activeAlerts.length}
            </Badge>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-1" />
              Novo Alerta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Alerta de RTP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="game-select">Jogo</Label>
                <select
                  id="game-select"
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="">Selecione um jogo</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name} (RTP atual: {game.rtp}%)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="target-rtp">RTP Alvo (%)</Label>
                <Input
                  id="target-rtp"
                  type="number"
                  min="85"
                  max="100"
                  step="0.1"
                  value={targetRTP}
                  onChange={(e) => setTargetRTP(e.target.value)}
                  placeholder="Ex: 97.5"
                />
              </div>

              <Button onClick={handleAddAlert} className="w-full">
                Criar Alerta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta configurado</p>
            <p className="text-sm">Crie alertas para ser notificado quando um jogo atingir o RTP desejado</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const status = getAlertStatus(alert);
            
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-colors ${
                  status?.isTriggered 
                    ? 'bg-success/10 border-success/30' 
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {alert.gameName}
                      </h4>
                      {status?.isTriggered && (
                        <Badge className="bg-success text-success-foreground text-xs">
                          Ativado!
                        </Badge>
                      )}
                      {!alert.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Pausado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>RTP Alvo: {alert.targetRTP}%</div>
                      {status && (
                        <div>
                          RTP Atual: {status.currentRTP}% 
                          <span className={`ml-1 ${
                            status.difference >= 0 ? 'text-success' : 'text-muted-foreground'
                          }`}>
                            ({status.difference >= 0 ? '+' : ''}{status.difference.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                      <div>Criado: {alert.createdAt}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onToggleAlert(alert.id)}
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onRemoveAlert(alert.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}