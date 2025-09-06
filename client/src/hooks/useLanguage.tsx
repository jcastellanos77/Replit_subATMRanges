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
    'hero.title': 'ATM',
    'hero.subtitle': 'Armeros',
    'hero.description': 'Directorio de armeros especializados certificados por ATM',

    // Search and Filters
    'search.placeholder': 'Buscar armeros...',
    'filter.category.all': 'Todas las categorías',
    'filter.city.all': 'Todas las ciudades',
    'filter.state.all': 'Todos los estados',
    'filter.results': 'resultados encontrados',
    'filter.category.label': 'Categoría',
    'filter.city.label': 'Ciudad',
    'filter.state.label': 'Estado',

    // No Results
    'no-results.title': 'No se encontraron armeros',
    'no-results.description': 'Intenta ajustar tus filtros de búsqueda',

    // Footer
    'footer.organization': 'Alianza de Tiradores en México',
    'footer.description': 'Promoviendo servicios de armería seguros, responsables y legales para deporte, defensa personal y propósitos legítimos dentro del marco legal mexicano.',
    'footer.contact.title': 'Contacto',
    'footer.copyright': '© 2024 ATM México. Todos los derechos reservados.',

    // Language Selector
    'language.spanish': 'Español',
    'language.english': 'English',

    // Sidebar Menu Items
    'nav.menu': 'Menú',
    'menu.main': 'Sitio Principal',
    'menu.education': 'Educación',
    'menu.statistics': 'Estadísticas',
    'menu.events': 'Eventos',
    'menu.ranges': 'Campos de Tiro',
    'menu.gunsmiths': 'Armeros',
    'menu.stores': 'Tiendas',
    'menu.training': 'Entrenamiento',
    'menu.membership': 'Membresía',
    'menu.publications': 'Publicaciones',
    'menu.media': 'Medios',
    'menu.legal': 'Legal',
    'menu.blog': 'Blog',
    'nav.mission': 'MISIÓN',
    'nav.objectives': 'OBJETIVOS',
    'nav.values': 'VALORES',
    'nav.join': 'ÚNETE',
    'nav.login': 'INICIAR SESIÓN',
  },
  en: {
    // Header Navigation
    'nav.contact': 'CONTACT',
    'nav.about': 'ABOUT US',
    'auth.login': 'LOG IN',

    // Hero Section
    'hero.title': 'ATM',
    'hero.subtitle': 'Gunsmiths',
    'hero.description': 'Directory of ATM certified specialized gunsmiths',

    // Search and Filters
    'search.placeholder': 'Search gunsmiths...',
    'filter.category.all': 'All categories',
    'filter.city.all': 'All cities',
    'filter.state.all': 'All states',
    'filter.results': 'results found',
    'filter.category.label': 'Category',
    'filter.city.label': 'City',
    'filter.state.label': 'State',

    // No Results
    'no-results.title': 'No gunsmiths found',
    'no-results.description': 'Try adjusting your search filters',

    // Footer
    'footer.organization': 'Alliance of Shooters in Mexico',
    'footer.description': 'Promoting safe, responsible and legal gunsmithing services for sport, personal defense and legitimate purposes within the Mexican legal framework.',
    'footer.contact.title': 'Contact',
    'footer.copyright': '© 2024 ATM Mexico. All rights reserved.',

    // Language Selector
    'language.spanish': 'Spanish',
    'language.english': 'English',

    // Sidebar Menu Items
    'nav.menu': 'Menu',
    'menu.main': 'Main menu',
    'menu.education': 'Education',
    'menu.statistics': 'Statistics',
    'menu.events': 'Events',
    'menu.ranges': 'Shooting Ranges',
    'menu.gunsmiths': 'Gunsmiths',
    'menu.stores': 'Stores',
    'menu.training': 'Training',
    'menu.membership': 'Membership',
    'menu.publications': 'Publications',
    'menu.media': 'Media',
    'menu.legal': 'Legal',
    'menu.blog': 'Blog',
    'nav.mission': 'MISSION',
    'nav.objectives': 'OBJECTIVES',
    'nav.values': 'VALUES',
    'nav.join': 'JOIN US',
    'nav.login': 'LOGIN',
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