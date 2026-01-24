import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GenreFilter from "@/components/GenreFilter";
import MovieSection from "@/components/MovieSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 md:pt-20">
        <HeroSection />
        
        <GenreFilter />
        
        <MovieSection 
          title="Now Showing" 
          subtitle="Currently playing in theaters near you"
        />
        
        <MovieSection 
          title="Coming Soon" 
          subtitle="Upcoming releases you don't want to miss"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
