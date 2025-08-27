import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Menu, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSelector from "@/components/LanguageSelector";

export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const menuItems = [
    { key: 'menu.main', label: t('menu.main') },
    { key: 'menu.education', label: t('menu.education') },
    { key: 'menu.statistics', label: t('menu.statistics') },
    { key: 'menu.events', label: t('menu.events') },
    { key: 'menu.ranges', label: t('menu.ranges') },
    { key: 'menu.gunsmiths', label: t('menu.gunsmiths') },
    { key: 'menu.stores', label: t('menu.stores') },
    { key: 'menu.training', label: t('menu.training') },
    { key: 'menu.membership', label: t('menu.membership') },
    { key: 'menu.publications', label: t('menu.publications') },
    { key: 'menu.media', label: t('menu.media') },
    { key: 'menu.legal', label: t('menu.legal') },
    { key: 'menu.blog', label: t('menu.blog') }
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Sidebar Menu */}
        <div className="flex items-center">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                className="bg-atm-green-2 hover:bg-atm-green-1 text-white px-4 py-2 rounded-full font-semibold transition-colors duration-200"
                data-testid="button-menu-toggle"
              >
                <Menu size={20} className="mr-2" />
                ATM
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-black/10 border-gray-800 [&>button]:text-white [&>button]:hover:text-atm-green-2 [&>button]:w-8 [&>button]:h-8 [&>button>svg]:w-6 [&>button>svg]:h-6">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Main navigation menu with ATM sections</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <h2 className="text-xl font-bold text-atm-green-2">{t('nav.menu')} ATM</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <nav className="p-6">
                    <div className="space-y-4">
                      {menuItems.map((item) => (
                        item.key === 'menu.stores' || item.key === 'menu.training' ? (
                          <div
                            key={item.key}
                            className="block text-gray-400 px-4 py-3 rounded-lg cursor-default"
                            data-testid={`text-${item.key.split('.')[1]}`}
                          >
                            {item.label}
                          </div>
                        ) : (
                          <a
                            key={item.key}
                            href={
                              item.key === 'menu.main' ? '#' :
                              `#${item.key.split('.')[1]}`
                            }
                            className="block text-white hover:text-atm-green-2 hover:bg-gray-900 px-4 py-3 rounded-lg transition-colors duration-200"
                            data-testid={`link-${item.key.split('.')[1]}`}
                            onClick={(e) => {
                              setSidebarOpen(false);
                              if (item.key === 'menu.main') {
                                e.preventDefault();
                                window.location.href = 'https://alianzatiradoresmx.org';
                              }
                            }}
                          >
                            {item.label}
                          </a>
                        )
                      ))}
                    </div>
                  </nav>
                </div>
                <div className="p-6 border-t border-gray-800">
                  <p className="text-xs text-gray-500 text-center">
                    Alianza de Tiradores en México
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* User Account & Language Section */}
        <div className="flex items-center space-x-4">
          <a
            href="#contact"
            className="hidden md:block text-white hover:text-atm-green-3 transition-colors duration-200"
            data-testid="link-contact"
          >
            {t('nav.contact')}
          </a>
          <LanguageSelector />
          <span
            className="text-sm text-gray-300"
            data-testid="text-login"
          >
            {t('nav.login')}
          </span>
          <User
            className="text-2xl text-gray-300 hover:text-atm-green-1 cursor-pointer transition-colors duration-200"
            data-testid="icon-user"
            size={24}
          />
        </div>
      </div>
    </nav>
  );
}