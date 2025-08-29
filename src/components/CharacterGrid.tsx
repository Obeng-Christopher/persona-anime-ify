import { useState, useEffect } from "react";
import CharacterCard from "./CharacterCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Character {
  id: string;
  name: string;
  anime_series: string;
  image_url: string;
}

interface CharacterGridProps {
  onCharacterSelect?: (character: Character) => void;
  selectedCharacter?: Character | null;
  showTitle?: boolean;
  showSearch?: boolean;
  showActionButton?: boolean;
}

const CharacterGrid = ({ 
  onCharacterSelect,
  selectedCharacter,
  showTitle = true,
  showSearch = true,
  showActionButton = true
}: CharacterGridProps) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('name');

      if (error) throw error;
      setCharacters(data || []);
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.anime_series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCharacterClick = (character: Character) => {
    if (onCharacterSelect) {
      onCharacterSelect(character);
    }
  };

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gradient-card rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={showTitle ? "py-20 px-6" : "px-6"}>
      <div className="max-w-7xl mx-auto">
        {showTitle && (
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              Choose Your Character
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select from our collection of popular anime characters and transform yourself into your favorite hero
            </p>
          </div>
        )}

        {/* Search bar */}
        {showSearch && (
          <div className="max-w-md mx-auto mb-12">
            <Input
              type="text"
              placeholder="Search characters or anime series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card/50 border-border/30 text-foreground placeholder:text-muted-foreground backdrop-blur-sm"
            />
          </div>
        )}

        {/* Character grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              name={character.name}
              series={character.anime_series}
              image={character.image_url}
              isSelected={selectedCharacter?.id === character.id}
              onClick={() => handleCharacterClick(character)}
            />
          ))}
        </div>

        {/* Action buttons */}
        {showActionButton && selectedCharacter && (
          <div className="text-center animate-float">
            <div className="mb-6">
              <p className="text-lg text-foreground">
                Ready to transform as{" "}
                <span className="font-bold bg-gradient-secondary bg-clip-text text-transparent">
                  {selectedCharacter.name}
                </span>
                ?
              </p>
            </div>
            <Button variant="hero" size="xl" className="glow-primary">
              Upload Your Photo
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CharacterGrid;