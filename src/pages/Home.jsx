import HeroSlider from '../components/HeroSlider';
import MovieList from '../components/MovieList';

function Home() {
  return (
    <>
      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Movie List Section */}
      <div className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MovieList />
        </div>
      </div>
    </>
  );
}

export default Home;
