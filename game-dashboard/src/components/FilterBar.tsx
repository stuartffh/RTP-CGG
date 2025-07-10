import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedProvider: string;
  onProviderChange: (value: string) => void;
  selectedRTPRange: string;
  onRTPRangeChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: () => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedProvider,
  onProviderChange,
  selectedRTPRange,
  onRTPRangeChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  activeFiltersCount
}: FilterBarProps) {
  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "slots", label: "Slots" },
    { value: "table", label: "Mesa" },
    { value: "card", label: "Cartas" },
    { value: "live", label: "Ao Vivo" }
  ];

  const providers = [
    { value: "all", label: "Todos os Provedores" },
    { value: "pragmatic", label: "Pragmatic Play" },
    { value: "evolution", label: "Evolution" },
    { value: "netent", label: "NetEnt" },
    { value: "microgaming", label: "Microgaming" },
    { value: "playtech", label: "Playtech" }
  ];

  const rtpRanges = [
    { value: "all", label: "Todos os RTPs" },
    { value: "97+", label: "97%+ (Excelente)" },
    { value: "95-97", label: "95%-97% (Bom)" },
    { value: "90-95", label: "90%-95% (Regular)" },
    { value: "<90", label: "<90% (Baixo)" }
  ];

  const sortOptions = [
    { value: "name", label: "Nome" },
    { value: "rtp", label: "RTP" },
    { value: "priority", label: "Prioridade" },
    { value: "lastUpdated", label: "Última Atualização" },
    { value: "provider", label: "Provedor" }
  ];

  return (
    <div className="space-y-4 p-4 bg-card rounded-xl border">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar jogos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedProvider} onValueChange={onProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Provedor" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.value} value={provider.value}>
                {provider.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRTPRange} onValueChange={onRTPRangeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Faixa de RTP" />
          </SelectTrigger>
          <SelectContent>
            {rtpRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={onSortOrderChange}
            className="shrink-0"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Active Filters & Clear */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}