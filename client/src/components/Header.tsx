import { useLanguage } from '@/hooks/useLanguage';
import LanguageSelector from '@/components/LanguageSelector';

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
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-atm-white px-3 py-1 rounded-full text-sm font-bold font-serif" style={{backgroundColor: '#62EF83'}}>
                ATM
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white hover:text-atm-green transition-colors duration-300" data-testid="nav-contact">{t('nav.contact')}</a>
              <a href="#" className="text-white hover:text-atm-green transition-colors duration-300" data-testid="nav-about">{t('nav.about')}</a>
            </div>
            
            {/* Language and Login */}
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <button className="text-white hover:text-atm-green transition-colors duration-300 flex items-center space-x-2" data-testid="button-login">
                <span className="text-sm">{t('auth.login')}</span>
                <i className="fas fa-user"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section with Cloudy Sky Background */}
      <div className="relative h-64" style={heroStyle}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight font-serif">ATM</h1>
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
