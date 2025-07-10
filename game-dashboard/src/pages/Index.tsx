import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GameCard, Game } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { FilterBar } from "@/components/FilterBar";
import { AlertsPanel, GameAlert } from "@/components/AlertsPanel";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  Gamepad2, 
  Star, 
  Clock,
  BarChart3,
  Zap,
  RefreshCw,
  Users,
  Settings,
  LogOut,
  Trophy
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

// Transform API data to match our Game interface
const transformGameData = (apiGame: any): Game => {
  const rtpPercent = (apiGame.rtp / 100).toFixed(1);
  
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (apiGame.extra <= -200) priority = 'high';
  else if (apiGame.extra < 0) priority = 'medium';
  else priority = 'low';

  // Determine category from provider or game name
  let category: 'slots' | 'table' | 'live' = 'slots';
  if (apiGame.name.toLowerCase().includes('roulette') || 
      apiGame.name.toLowerCase().includes('blackjack') ||
      apiGame.name.toLowerCase().includes('baccarat')) {
    category = 'table';
  }
  if (apiGame.provider_name?.toLowerCase().includes('evolution')) {
    category = 'live';
  }

  return {
    id: apiGame.id.toString(),
    name: apiGame.name,
    imageUrl: apiGame.image_url || `https://cgg.bet.br/static/v1/casino/game/0/${apiGame.id}/big.webp`,
    rtp: parseFloat(rtpPercent),
    priority,
    category,
    provider: apiGame.provider_name || 'Unknown',
    lastUpdated: '0 sec',
    isHot: apiGame.extra >= 100,
    isNew: Math.random() > 0.8, // Random new flag
    variance: priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low',
    maxWin: category === 'slots' ? `${Math.floor(Math.random() * 10000)}x` : '2x'
  };
};

const Index = () => {
  const { toast } = useToast();
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedRTPRange, setSelectedRTPRange] = useState("all");
  const [sortBy, setSortBy] = useState("rtp");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [alerts, setAlerts] = useState<GameAlert[]>([]);
  const [activeTab, setActiveTab] = useState("tempo-real");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch games from API
  const fetchGames = async (mode: 'live' | 'melhores' = 'live') => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-games', {
        body: { mode }
      });

      if (error) throw error;

      const transformedGames = data.map(transformGameData);
      setGames(transformedGames);
      
      return transformedGames;
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Erro ao carregar jogos",
        description: "Usando dados de demonstração.",
        variant: "destructive"
      });
      
      // Fallback to sample data
      const sampleData = [
        {
          id: 1001,
          name: "Sweet Bonanza",
          provider_name: "Pragmatic Play",
          image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          rtp: 9620,
          extra: -150,
          rtp_semana: 9580,
          extra_semana: -200
        },
        {
          id: 1002,
          name: "Gates of Olympus",
          provider_name: "Pragmatic Play", 
          image_url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=300&fit=crop",
          rtp: 9640,
          extra: 50,
          rtp_semana: 9630,
          extra_semana: 30
        }
      ];
      
      const fallbackGames = sampleData.map(transformGameData);
      setGames(fallbackGames);
      return fallbackGames;
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    fetchGames();
    
    const interval = setInterval(() => {
      fetchGames();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Load user alerts
  useEffect(() => {
    if (user) {
      loadUserAlerts();
    }
  }, [user]);

  const loadUserAlerts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const userAlerts: GameAlert[] = data.map(alert => ({
        id: alert.id,
        gameId: alert.game_id.toString(),
        gameName: alert.game_name,
        targetRTP: alert.target_rtp,
        isActive: true,
        createdAt: new Date(alert.created_at).toLocaleDateString('pt-BR')
      }));

      setAlerts(userAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filtered = games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
      const matchesProvider = selectedProvider === "all" || game.provider.toLowerCase().includes(selectedProvider.toLowerCase());
      
      let matchesRTP = true;
      if (selectedRTPRange !== "all") {
        switch (selectedRTPRange) {
          case "97+":
            matchesRTP = game.rtp >= 97;
            break;
          case "95-97":
            matchesRTP = game.rtp >= 95 && game.rtp < 97;
            break;
          case "90-95":
            matchesRTP = game.rtp >= 90 && game.rtp < 95;
            break;
          case "<90":
            matchesRTP = game.rtp < 90;
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesProvider && matchesRTP;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Game];
      let bValue: any = b[sortBy as keyof Game];

      if (sortBy === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [games, searchTerm, selectedCategory, selectedProvider, selectedRTPRange, sortBy, sortOrder]);

  // Get best games (highest RTP)
  const bestGames = useMemo(() => {
    return [...games].sort((a, b) => b.rtp - a.rtp).slice(0, 6);
  }, [games]);

  // Display games based on active tab
  const displayGames = activeTab === "melhores" ? bestGames : filteredAndSortedGames;

  // Statistics
  const stats = useMemo(() => {
    const avgRTP = games.reduce((sum, game) => sum + game.rtp, 0) / games.length;
    const highRTPGames = games.filter(game => game.rtp >= 97).length;
    const activeAlerts = alerts.filter(alert => alert.isActive).length;
    const onlineGames = games.length;

    return {
      avgRTP: avgRTP.toFixed(1),
      highRTPGames,
      activeAlerts,
      onlineGames
    };
  }, [games, alerts]);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleAddAlert = async (gameId: string, gameName: string, targetRTP: number) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para criar alertas.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_alerts')
        .insert({
          user_id: user.id,
          game_id: parseInt(gameId),
          game_name: gameName,
          target_rtp: targetRTP
        });

      if (error) throw error;

      const newAlert: GameAlert = {
        id: Date.now().toString(),
        gameId,
        gameName,
        targetRTP,
        isActive: true,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      
      setAlerts(prev => [...prev, newAlert]);
      toast({
        title: "Alerta criado!",
        description: `Você será notificado quando ${gameName} atingir ${targetRTP}% RTP.`,
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Erro ao criar alerta",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast({
        title: "Alerta removido",
        description: "O alerta foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error removing alert:', error);
      toast({
        title: "Erro ao remover alerta",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await fetchGames(activeTab === 'melhores' ? 'melhores' : 'live');
      toast({
        title: "Dados atualizados!",
        description: "As informações dos jogos foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive"
      });
    }
    
    setIsRefreshing(false);
  };

  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedProvider !== "all", 
    selectedRTPRange !== "all",
    searchTerm.length > 0
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedProvider("all");
    setSelectedRTPRange("all");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold gradient-text">RTP Monitor</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    Olá, {profile?.name || user.email}
                  </div>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin")}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-64 md:h-80 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative text-center space-y-4 px-4">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            RTP Monitor
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Monitore em tempo real o RTP dos seus jogos favoritos e maximize seus ganhos
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-success/20 text-success">
              <Zap className="w-3 h-3 mr-1" />
              Tempo Real
            </Badge>
            <Badge className="bg-primary/20 text-primary">
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics Avançado
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="RTP Médio"
            value={`${stats.avgRTP}%`}
            description="Média geral"
            icon={TrendingUp}
            trend={{ value: 2.3, isPositive: true }}
          />
          <StatsCard
            title="Jogos Online"
            value={stats.onlineGames}
            description="Ativos agora"
            icon={Gamepad2}
          />
          <StatsCard
            title="RTP Excelente"
            value={stats.highRTPGames}
            description="97%+ RTP"
            icon={Star}
          />
          <StatsCard
            title="Alertas Ativos"
            value={stats.activeAlerts}
            description="Monitorando"
            icon={Clock}
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="tempo-real" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Tempo Real
                  </TabsTrigger>
                  <TabsTrigger value="melhores" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Melhores
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Filters - Only show for real-time tab */}
            {activeTab === "tempo-real" && (
              <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
                selectedRTPRange={selectedRTPRange}
                onRTPRangeChange={setSelectedRTPRange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                onClearFilters={clearFilters}
                activeFiltersCount={activeFiltersCount}
              />
            )}

            {/* Games Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {activeTab === "melhores" ? "Melhores Jogos" : "Jogos em Tempo Real"}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{displayGames.length} jogos encontrados</span>
                </div>
              </div>

              {displayGames.length === 0 ? (
                <div className="text-center py-12">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum jogo encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros para encontrar mais jogos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={handleGameClick}
                      isInAlert={alerts.some(alert => alert.gameId === game.id && alert.isActive)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AlertsPanel
              alerts={alerts}
              onAddAlert={handleAddAlert}
              onRemoveAlert={handleRemoveAlert}
              onToggleAlert={handleToggleAlert}
              games={games}
            />
          </div>
        </div>
      </div>

      {/* Game Modal */}
      <GameModal
        game={selectedGame}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddAlert={(game) => handleAddAlert(game.id, game.name, game.rtp + 1)}
      />
    </div>
  );
};

export default Index;