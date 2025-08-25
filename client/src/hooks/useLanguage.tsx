import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  es: {
    // Header Navigation
    'nav.contact': 'CONTACTO',
    'nav.about': 'NOSOTROS',
    'auth.login': 'INICIAR SESIÓN',
    
    // Hero Section
    'hero.title': 'A.T.M.',
    'hero.subtitle': 'Tiendas',
    'hero.description': 'Directorio de tiendas especializadas certificadas por ATM',
    
    // Search and Filters
    'search.placeholder': 'Buscar tiendas...',
    'filter.category.all': 'Todas las categorías',
    'filter.city.all': 'Todas las ciudades',
    'filter.state.all': 'Todos los estados',
    'filter.results': 'resultados encontrados',
    'filter.category.label': 'Categoría',
    'filter.city.label': 'Ciudad',
    'filter.state.label': 'Estado',
    
    // No Results
    'no-results.title': 'No se encontraron tiendas',
    'no-results.description': 'Intenta ajustar tus filtros de búsqueda',
    
    // Footer
    'footer.organization': 'Alianza de Tiradores en México',
    'footer.description': 'Promoviendo entrenamiento seguro, responsable y legal con armas de fuego para deporte, defensa personal y propósitos legítimos dentro del marco legal mexicano.',
    'footer.contact.title': 'Contacto',
    'footer.copyright': '© 2024 ATM México. Todos los derechos reservados.',
    
    // Language Selector
    'language.spanish': 'Español',
    'language.english': 'English',
  },
  en: {
    // Header Navigation
    'nav.contact': 'CONTACT',
    'nav.about': 'ABOUT US',
    'auth.login': 'LOG IN',
    
    // Hero Section
    'hero.title': 'A.T.M.',
    'hero.subtitle': 'Shops',
    'hero.description': 'Directory of specialized shops certified by ATM',
    
    // Search and Filters
    'search.placeholder': 'Search shops...',
    'filter.category.all': 'All categories',
    'filter.city.all': 'All cities',
    'filter.state.all': 'All states',
    'filter.results': 'results found',
    'filter.category.label': 'Category',
    'filter.city.label': 'City',
    'filter.state.label': 'State',
    
    // No Results
    'no-results.title': 'No shops found',
    'no-results.description': 'Try adjusting your search filters',
    
    // Footer
    'footer.organization': 'Mexican Shooters Alliance',
    'footer.description': 'Promoting safe, responsible and legal firearms training for sport, personal defense and legitimate purposes within the Mexican legal framework.',
    'footer.contact.title': 'Contact',
    'footer.copyright': '© 2024 ATM Mexico. All rights reserved.',
    
    // Language Selector
    'language.spanish': 'Español',
    'language.english': 'English',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('es'); // Spanish as default

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}