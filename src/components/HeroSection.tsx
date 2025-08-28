import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-transformation.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-primary rounded-full animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6 animate-glow-pulse">
          AnimeMe
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
          Transform your photos into stunning anime art
        </p>
        
        <p className="text-lg md:text-xl text-foreground/80 mb-12 max-w-3xl mx-auto">
          Choose your favorite anime character and watch as AI magic transforms you into their world. 
          From Naruto to Goku, become any anime hero in seconds!
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            variant="hero" 
            size="xl"
            className="w-full sm:w-auto"
          >
            Start Your Transformation
          </Button>
          
          <Button 
            variant="anime" 
            size="xl"
            className="w-full sm:w-auto"
          >
            View Gallery
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-border/30">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
              50+
            </div>
            <div className="text-muted-foreground mt-2">Anime Characters</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              AI Powered
            </div>
            <div className="text-muted-foreground mt-2">Transformations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Instant
            </div>
            <div className="text-muted-foreground mt-2">Results</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;