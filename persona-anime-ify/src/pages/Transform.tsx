import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon, Sparkles, Download, Wand2, Zap, Star } from "lucide-react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { toast } from "sonner";
import CharacterCard from "@/components/CharacterCard";
import { supabase } from "@/integrations/supabase/client";

interface Character {
  id: string;
  name: string;
  anime_series: string;
  image_url: string;
}

const Transform = () => {
  const { user } = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  };

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.anime_series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Image size must be less than 10MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setTransformedImage(null); // Reset transformed image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!uploadedImage || !selectedCharacter) {
      toast.error("Please upload an image and select a character");
      return;
    }

    setIsTransforming(true);
    try {
      const response = await fetch(`https://dajghtnduzkdpdgglany.supabase.co/functions/v1/transform-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          image: uploadedImage,
          character_id: selectedCharacter.id,
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transformation failed');
      }

      const data = await response.json();
      setTransformedImage(data.transformed_image);
      toast.success("Transformation completed!");
    } catch (error) {
      console.error('Transformation error:', error);
      toast.error(`Transformation failed: ${error.message}`);
    } finally {
      setIsTransforming(false);
    }
  };

  const handleDownload = () => {
    if (transformedImage) {
      const link = document.createElement('a');
      link.download = `anime-transformation-${selectedCharacter?.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = transformedImage;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-accent/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* User button with enhanced styling */}
      <div className="absolute top-8 right-8 z-20">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-14 h-14 rounded-full border-2 border-primary/40 hover:border-primary transition-all duration-300 shadow-2xl hover:shadow-primary/25 hover:scale-110",
            }
          }}
        />
      </div>

      <div className="container mx-auto px-6 py-28 relative z-10">
        {/* Enhanced hero section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6 p-4 bg-gradient-primary/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <Star className="w-6 h-6 text-primary animate-pulse" />
            <span className="text-primary font-semibold text-sm">AI-Powered Transformation</span>
            <Star className="w-6 h-6 text-primary animate-pulse delay-300" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient-primary">Anime-ify</span>
            <br />
            <span className="text-gradient-secondary">Your World</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Transform your photos into stunning anime artwork with the power of AI. 
            Choose from legendary characters and watch the magic happen.
          </p>
          
          {user && (
            <div className="inline-flex items-center gap-3 p-4 bg-gradient-card rounded-2xl border border-primary/30 backdrop-blur-sm shadow-xl">
              <div className="w-3 h-3 bg-gradient-primary rounded-full animate-pulse"></div>
              <p className="text-primary font-semibold">
                Welcome back, {user.firstName || user.username || 'User'}! 🎉
              </p>
            </div>
          )}
        </div>

        {/* Main transformation workflow */}
        <div className="space-y-12">
          {/* Step 1 & 2 - Reorganized layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Step 1: Upload Card - Takes 2 columns */}
            <div className="xl:col-span-2 space-y-6">
              {/* Upload Card */}
              <Card className="group bg-gradient-card border-border/30 backdrop-blur-md shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden card-hover-effect">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <div className="bg-gradient-primary p-3 rounded-xl border border-primary/30 shadow-lg animate-bounce-gentle">
                      <Upload className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="text-gradient-primary">Step 1:</span>
                      <br />
                      <span className="text-foreground">Upload Your Photo</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                                 <CardContent className="relative">
                                       <div
                      className="relative border-2 border-dashed border-primary/30 rounded-2xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group/upload bg-gradient-to-br from-card/50 to-card/80"
                      onClick={() => fileInputRef.current?.click()}
                    >
                     {uploadedImage ? (
                       <div className="space-y-3">
                         <div className="relative">
                           <img
                             src={uploadedImage}
                             alt="Uploaded"
                             className="w-full h-auto max-h-64 mx-auto rounded-xl object-contain shadow-2xl glow-primary img-hover-effect"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity duration-300 rounded-xl flex items-end justify-center pb-3">
                             <Button variant="anime" size="lg" className="shadow-2xl btn-animate">
                               <Wand2 className="w-5 h-5 mr-2" />
                               Change Photo
                             </Button>
                           </div>
                         </div>
                       </div>
                                           ) : (
                        <div className="space-y-3 py-6">
                          <div className="relative">
                            <ImageIcon className="w-14 h-14 mx-auto text-primary/70 group-hover/upload:text-primary transition-colors duration-300 animate-float" />
                            <div className="absolute inset-0 bg-gradient-primary/20 rounded-full blur-xl opacity-0 group-hover/upload:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-foreground">Click to upload</p>
                            <p className="text-xs text-muted-foreground">PNG or JPG (Max 10MB)</p>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse"></div>
                            <span>Drag & drop supported</span>
                            <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse delay-150"></div>
                          </div>
                        </div>
                     )}
                   </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Character Selection - Below upload card */}
              <Card className="group bg-gradient-card border-border/30 backdrop-blur-md shadow-2xl hover:shadow-secondary/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden card-hover-effect">
                <div className="absolute inset-0 bg-gradient-to-bl from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <div className="bg-gradient-secondary p-3 rounded-xl border border-secondary/30 shadow-lg animate-bounce-gentle">
                      <Sparkles className="w-7 h-7 text-secondary-foreground" />
                    </div>
                    <div>
                      <span className="text-gradient-secondary">Step 2:</span>
                      <br />
                      <span className="text-foreground">Choose Your Character</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative">
                  {/* Search input */}
                  <div className="mb-4">
                    <Input
                      type="text"
                      placeholder="Search characters or anime series..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-card/50 border-border/30 text-foreground placeholder:text-muted-foreground backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 pb-4 min-w-max">
                      {filteredCharacters.map((character) => (
                        <CharacterCard
                          key={character.id}
                          name={character.name}
                          series={character.anime_series}
                          image={character.image_url}
                          isSelected={selectedCharacter?.id === character.id}
                          onClick={() => {
                            setSelectedCharacter(character);
                            setTransformedImage(null);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Transform Action */}
              {uploadedImage && selectedCharacter && (
                <div className="text-center">
                  <Card className="bg-gradient-card border-border/30 backdrop-blur-md shadow-2xl overflow-hidden card-hover-effect">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative">
                      <CardTitle className="text-2xl flex items-center justify-center gap-3">
                        <Zap className="w-6 h-6 text-accent animate-glow-pulse" />
                        Step 3: Create Your Transformation
                        <Zap className="w-6 h-6 text-accent animate-glow-pulse delay-300" />
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="relative space-y-6">
                      <Button
                        variant="anime"
                        size="xl"
                        onClick={handleTransform}
                        disabled={isTransforming}
                        className="w-full shadow-2xl hover:shadow-primary/30 transition-all duration-300 animate-float btn-animate"
                      >
                        {isTransforming ? (
                          <>
                            <div className="animate-spin w-7 h-7 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-3"></div>
                            <span className="text-lg">Transforming...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-7 h-7 mr-3 animate-float-slow" />
                            <span className="text-lg">Transform into {selectedCharacter.name}</span>
                          </>
                        )}
                      </Button>
                      
                      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-accent/50 rounded-full animate-pulse"></div>
                        <span>This process may take 30-60 seconds to complete</span>
                        <div className="w-2 h-2 bg-accent/50 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Step 4: Results Card - Right side, smaller size */}
            <div className="xl:col-span-1">
              <Card className="bg-gradient-card border-border/30 backdrop-blur-md shadow-2xl overflow-hidden card-hover-effect h-fit sticky top-8">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-4 text-xl">
                    <div className="bg-gradient-accent p-3 rounded-xl border border-accent/30 shadow-lg animate-bounce-gentle">
                      <Download className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <span className="text-gradient-accent">Step 4:</span>
                      <br />
                      <span className="text-foreground">See the Result</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="border-2 border-border/20 rounded-2xl p-6 text-center min-h-[20rem] flex items-center justify-center bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-sm relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-4 left-4 w-24 h-24 border border-primary/30 rounded-full animate-rotate-slow"></div>
                      <div className="absolute bottom-4 right-4 w-20 h-20 border border-secondary/30 rounded-full animate-rotate-slow delay-1000"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-accent/30 rounded-full animate-rotate-slow delay-2000"></div>
                    </div>
                    
                    {isTransforming ? (
                      <div className="space-y-4 relative z-10">
                        <div className="relative">
                          <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mx-auto shadow-2xl"></div>
                          <div className="absolute inset-0 bg-gradient-primary/20 rounded-full blur-xl animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-foreground">Creating your anime persona...</p>
                          <p className="text-sm text-muted-foreground">This can take up to a minute.</p>
                        </div>
                        <div className="loading-dots text-primary">
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                    ) : transformedImage ? (
                      <div className="space-y-4 w-full relative z-10">
                        <div className="relative">
                          <img
                            src={transformedImage}
                            alt="Transformed"
                            className="w-full h-auto max-h-64 mx-auto rounded-xl object-contain shadow-2xl glow-primary hover:glow-secondary transition-all duration-300 img-hover-effect"
                          />
                          <div className="absolute -top-2 -right-2 bg-gradient-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-lg animate-scale-pulse">
                            ✨ Complete!
                          </div>
                        </div>
                        <Button 
                          variant="hero" 
                          size="sm" 
                          onClick={handleDownload}
                          className="w-full flex items-center gap-2 shadow-2xl hover:shadow-primary/30 transition-all duration-300 btn-animate"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4 relative z-10">
                        <div className="relative">
                          <Sparkles className="w-16 h-16 mx-auto text-muted-foreground/50 animate-float-slow" />
                          <div className="absolute inset-0 bg-gradient-primary/10 rounded-full blur-xl"></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg text-muted-foreground">Your transformed image will appear here</p>
                          <p className="text-sm text-muted-foreground/70">Complete the steps above to get started</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transform;
