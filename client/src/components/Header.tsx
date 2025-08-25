import { useLanguage } from '@/hooks/useLanguage';
import Navigation from '@/components/Navigation';

export default function Header() {
  const { t } = useLanguage();
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.4), rgba(30, 41, 59, 0.4)), url(/assets/Fondo3_1756077663774.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <header className="relative">
      {/* Navigation with Sidebar */}
      <Navigation />
      
      {/* Hero Section with Cloudy Sky Background */}
      <div className="relative h-64" style={heroStyle}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight font-serif">{t('hero.title')}</h1>
            <h2 className="text-xl md:text-2xl font-light mb-4">{t('hero.subtitle')}</h2>
            <p className="text-base md:text-lg font-light max-w-2xl mx-auto px-4">
              {t('hero.description')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
