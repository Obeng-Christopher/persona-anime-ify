import { useState } from "react";
import CharacterCard from "./CharacterCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Character images
import narutoImg from "@/assets/characters/naruto.jpg";
import luffyImg from "@/assets/characters/luffy.jpg";
import gokuImg from "@/assets/characters/goku.jpg";
import dekuImg from "@/assets/characters/deku.jpg";
import tanjiroImg from "@/assets/characters/tanjiro.jpg";
import sasukeImg from "@/assets/characters/sasuke.jpg";

const characters = [
  { id: 1, name: "Naruto Uzumaki", series: "Naruto", image: narutoImg },
  { id: 2, name: "Monkey D. Luffy", series: "One Piece", image: luffyImg },
  { id: 3, name: "Goku", series: "Dragon Ball", image: gokuImg },
  { id: 4, name: "Deku", series: "My Hero Academia", image: dekuImg },
  { id: 5, name: "Tanjiro Kamado", series: "Demon Slayer", image: tanjiroImg },
  { id: 6, name: "Sasuke Uchiha", series: "Naruto", image: sasukeImg },
];

const CharacterGrid = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
            Choose Your Character
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select from our collection of popular anime characters and transform yourself into your favorite hero
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-12">
          <Input
            type="text"
            placeholder="Search characters or anime series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card/50 border-border/30 text-foreground placeholder:text-muted-foreground backdrop-blur-sm"
          />
        </div>

        {/* Character grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              name={character.name}
              series={character.series}
              image={character.image}
              isSelected={selectedCharacter === character.id}
              onClick={() => setSelectedCharacter(character.id)}
            />
          ))}
        </div>

        {/* Action buttons */}
        {selectedCharacter && (
          <div className="text-center animate-float">
            <div className="mb-6">
              <p className="text-lg text-foreground">
                Ready to transform as{" "}
                <span className="font-bold bg-gradient-secondary bg-clip-text text-transparent">
                  {characters.find(c => c.id === selectedCharacter)?.name}
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