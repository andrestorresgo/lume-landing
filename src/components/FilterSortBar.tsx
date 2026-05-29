import * as React from "react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { CaretDown } from "@phosphor-icons/react"

interface FilterSortBarProps {
  selectedStone: string | null;
  setSelectedStone: (stone: string | null) => void;
  selectedIntention: string | null;
  setSelectedIntention: (intention: string | null) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  stones: string[];
  intentions: string[];
}

const FilterSortBar = React.memo(function FilterSortBar({
  selectedStone,
  setSelectedStone,
  selectedIntention,
  setSelectedIntention,
  sortBy,
  setSortBy,
  stones,
  intentions
}: FilterSortBarProps) {
  const handleClear = React.useCallback(() => {
    setSelectedStone(null);
    setSelectedIntention(null);
  }, [setSelectedStone, setSelectedIntention]);

  const sortLabel = React.useMemo(() => {
    return {
      featured: "Destacados",
      "price-low-high": "Precio: Menor a Mayor",
      "price-high-low": "Precio: Mayor a Menor",
      name: "Nombre"
    }[sortBy] || "Destacados";
  }, [sortBy]);

  return (
    <section className="border-y border-[#78716C]/20 py-4 mb-16 px-6 md:px-16 sticky top-0 z-40 bg-[#fbf9f6]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-semibold text-[#1C1917] uppercase tracking-widest flex items-center gap-1.5">
            Filtros:
          </span>
          
          {/* Stone filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#78716C]/30 text-[#1C1917] hover:bg-[#efeeeb] text-xs font-medium px-3 py-1.5 h-auto flex items-center gap-1">
                <span>Piedra: {selectedStone || "Todas"}</span>
                <CaretDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#fbf9f6] border border-[#78716C]/20 shadow-lg text-[#1C1917]">
              <DropdownMenuLabel className="text-xs">Filtrar por Piedra</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#78716C]/10" />
              <DropdownMenuItem onClick={() => setSelectedStone(null)} className="focus:bg-[#efeeeb]">Todas</DropdownMenuItem>
              {stones.map(stone => (
                <DropdownMenuItem key={stone} onClick={() => setSelectedStone(stone)} className="focus:bg-[#efeeeb]">
                  {stone}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Intention filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#78716C]/30 text-[#1C1917] hover:bg-[#efeeeb] text-xs font-medium px-3 py-1.5 h-auto flex items-center gap-1">
                <span>Intención: {selectedIntention || "Todas"}</span>
                <CaretDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#fbf9f6] border border-[#78716C]/20 shadow-lg text-[#1C1917]">
              <DropdownMenuLabel className="text-xs">Filtrar por Intención</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#78716C]/10" />
              <DropdownMenuItem onClick={() => setSelectedIntention(null)} className="focus:bg-[#efeeeb]">Todas</DropdownMenuItem>
              {intentions.map(intention => (
                <DropdownMenuItem key={intention} onClick={() => setSelectedIntention(intention)} className="focus:bg-[#efeeeb]">
                  {intention}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {selectedStone || selectedIntention ? (
            <Button 
              variant="ghost" 
              onClick={handleClear}
              className="text-[#7C0A12] hover:text-[#560006] text-xs underline underline-offset-4 p-0 h-auto"
            >
              Limpiar filtros
            </Button>
          ) : null}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3 justify-end">
          <span className="text-xs text-[#78716C]">Ordenar por:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#78716C]/30 text-[#1C1917] hover:bg-[#efeeeb] text-xs font-medium px-4 py-1.5 h-auto flex items-center gap-1.5">
                <span>{sortLabel}</span>
                <CaretDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#fbf9f6] border border-[#78716C]/20 shadow-lg text-[#1C1917]">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                <DropdownMenuRadioItem value="featured" className="focus:bg-[#efeeeb]">Destacados</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-low-high" className="focus:bg-[#efeeeb]">Precio: Menor a Mayor</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-high-low" className="focus:bg-[#efeeeb]">Precio: Mayor a Menor</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name" className="focus:bg-[#efeeeb]">Nombre</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
});

export default FilterSortBar;
