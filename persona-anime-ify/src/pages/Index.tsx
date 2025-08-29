import HeroSection from "../components/HeroSection";
import CharacterGrid from "../components/CharacterGrid";
import FeatureSection from "../components/FeatureSection";
import Header from "../components/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <div id="characters">
        <CharacterGrid />
      </div>
      <div id="features">
        <FeatureSection />
      </div>
    </div>
  );
};

export default Index;
