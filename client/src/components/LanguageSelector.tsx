import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useLanguage } from '@/hooks/useLanguage';
import { US, MX } from 'country-flag-icons/react/3x2';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-auto px-2 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-600 flex items-center gap-1"
          data-testid="button-language-selector"
        >
          <div className="flex items-center gap-1">
            {/* Current Flag */}
            <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-500">
              {language === 'es' ? (
                <MX className="w-full h-full" />
              ) : (
                <US className="w-full h-full" />
              )}
            </div>
            <span className="text-white text-xs font-medium">
              {language === 'es' ? 'ES' : 'EN'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-gray-800 border-gray-600">
        <DropdownMenuItem
          onClick={() => setLanguage('es')}
          className="flex items-center gap-2 text-white hover:bg-gray-700 cursor-pointer"
          data-testid="option-spanish"
        >
          <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-500">
            <MX className="w-full h-full" />
          </div>
          <span className="text-sm">Español</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className="flex items-center gap-2 text-white hover:bg-gray-700 cursor-pointer"
          data-testid="option-english"
        >
          <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-500">
            <US className="w-full h-full" />
          </div>
          <span className="text-sm">English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}