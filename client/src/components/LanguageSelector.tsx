import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ChevronDown } from 'lucide-react';
import ES from 'country-flag-icons/react/3x2/ES';
import US from 'country-flag-icons/react/3x2/US';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'es' as const, label: t('language.spanish'), flag: ES },
    { code: 'en' as const, label: t('language.english'), flag: US },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);
  const FlagComponent = currentLanguage?.flag || ES;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-atm-green transition-colors duration-300 bg-black bg-opacity-20 rounded-lg px-3 py-2"
        data-testid="button-language-selector"
      >
        <div className="w-5 h-4 rounded-sm overflow-hidden">
          <FlagComponent className="w-full h-full object-cover" />
        </div>
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-atm-dark rounded-lg shadow-lg border border-gray-600 z-50">
          {languages.map((lang) => {
            const LangFlagComponent = lang.flag;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  language === lang.code ? 'bg-gray-700' : ''
                }`}
                data-testid={`option-language-${lang.code}`}
              >
                <div className="w-5 h-4 rounded-sm overflow-hidden flex-shrink-0">
                  <LangFlagComponent className="w-full h-full object-cover" />
                </div>
                <span className="text-white text-sm">{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}