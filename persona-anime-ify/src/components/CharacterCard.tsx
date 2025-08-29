import { cn } from "@/lib/utils";

interface CharacterCardProps {
  name: string;
  series: string;
  image: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const CharacterCard = ({ 
  name, 
  series, 
  image, 
  isSelected = false,
  onClick,
  className 
}: CharacterCardProps) => {
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-gradient-card transition-all duration-300 cursor-pointer",
        "hover:scale-105 hover:glow-primary",
        isSelected && "glow-secondary scale-105",
        className
      )}
      onClick={onClick}
    >
      {/* Character image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={`${name} from ${series}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      {/* Character info overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{series}</p>
        </div>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-accent rounded-full flex items-center justify-center animate-pulse">
          <svg 
            className="w-4 h-4 text-accent-foreground" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      )}
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" />
    </div>
  );
};

export default CharacterCard;