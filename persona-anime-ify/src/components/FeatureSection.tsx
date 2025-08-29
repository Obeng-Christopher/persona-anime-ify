import { Button } from "@/components/ui/button";

const features = [
  {
    title: "AI-Powered Transformation",
    description: "Advanced AI technology analyzes your photo and seamlessly transforms you into your chosen anime character while preserving your unique features.",
    icon: "🤖",
  },
  {
    title: "50+ Anime Characters",
    description: "Choose from a vast collection of popular anime characters from Naruto, One Piece, Dragon Ball, My Hero Academia, and many more.",
    icon: "👥",
  },
  {
    title: "Instant Results",
    description: "Get your anime transformation in seconds. Our optimized AI processes your image quickly without compromising on quality.",
    icon: "⚡",
  },
  {
    title: "High-Quality Output",
    description: "Download your transformed images in high resolution, perfect for social media profiles, wallpapers, or printing.",
    icon: "🎨",
  },
  {
    title: "Personal Gallery",
    description: "Save all your transformations in your personal gallery. Create collections and share your favorite anime versions with friends.",
    icon: "🖼️",
  },
  {
    title: "Secure & Private",
    description: " Your photos are processed securely and automatically deleted after transformation. We respect your privacy completely.",
    icon: "🔒",
  },
];

const FeatureSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-transparent to-background/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gradient-secondary mb-6">
            Why Choose AnimeMe?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the magic of anime transformation with our cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-xl bg-gradient-card border border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:glow-primary"
            >
              <div className="text-4xl mb-4 animate-float" style={{ animationDelay: `${index * 0.1}s` }}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient-primary transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center bg-gradient-card rounded-2xl p-12 border border-border/30">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Become an Anime Hero?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already discovered their anime alter ego. 
            Start your transformation journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl">
              Get Started Now
            </Button>
            <Button variant="outline" size="xl">
              View Examples
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;