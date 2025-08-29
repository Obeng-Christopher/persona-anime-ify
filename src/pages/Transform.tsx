import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import CharacterGrid from "@/components/CharacterGrid";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch('/api/transform-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          character_id: selectedCharacter.id,
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Transformation failed');
      }

      const data = await response.json();
      setTransformedImage(data.transformed_image);
      toast.success("Transformation completed!");
    } catch (error) {
      console.error('Transformation error:', error);
      toast.error("Transformation failed. Please try again.");
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
    <div className="min-h-screen pt-20 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Transform Your Photo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your photo, choose your favorite anime character, and watch the magic happen!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Upload Section */}
          <Card className="bg-gradient-card border border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Upload className="w-5 h-5" />
                Upload Your Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="max-w-full max-h-64 mx-auto rounded-lg object-contain"
                    />
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium text-foreground">Click to upload</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
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

          {/* Result Section */}
          <Card className="bg-gradient-card border border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5" />
                Transformed Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center min-h-64 flex items-center justify-center">
                {isTransforming ? (
                  <div className="space-y-4">
                    <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
                    <p className="text-foreground">Creating your anime transformation...</p>
                  </div>
                ) : transformedImage ? (
                  <div className="space-y-4">
                    <img
                      src={transformedImage}
                      alt="Transformed"
                      className="max-w-full max-h-64 mx-auto rounded-lg object-contain glow-primary"
                    />
                    <Button 
                      variant="hero" 
                      size="sm" 
                      onClick={handleDownload}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your transformed image will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Character Selection */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-secondary bg-clip-text text-transparent mb-4">
              Choose Your Character
            </h2>
            <p className="text-lg text-muted-foreground">
              Select the anime character you want to transform into
            </p>
          </div>

          <CharacterGrid 
            onCharacterSelect={(character) => {
              setSelectedCharacter(character);
              setTransformedImage(null); // Reset transformed image when character changes
            }}
            selectedCharacter={selectedCharacter}
            showTitle={false}
            showSearch={true}
            showActionButton={false}
          />
        </div>

        {/* Transform Button */}
        {uploadedImage && selectedCharacter && (
          <div className="text-center">
            <Button
              variant="hero"
              size="xl"
              onClick={handleTransform}
              disabled={isTransforming}
              className="glow-primary animate-float"
            >
              {isTransforming ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2"></div>
                  Transforming...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Transform into {selectedCharacter.name}
                </>
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              This may take 30-60 seconds to complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transform;