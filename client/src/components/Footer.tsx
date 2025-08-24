export default function Footer() {
  return (
    <footer className="bg-atm-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-atm-green text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
                ATM
              </div>
              <span className="text-lg font-semibold">Alianza de Tiradores en México</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Promoviendo entrenamiento seguro, responsable y legal con armas de fuego para deporte, defensa personal y propósitos legítimos dentro del marco legal mexicano.
            </p>
            <div className="text-sm text-gray-400">
              © 2024 ATM México. Todos los derechos reservados.
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-atm-green transition-colors duration-300" data-testid="footer-link-mission">
                  Misión
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-atm-green transition-colors duration-300" data-testid="footer-link-objectives">
                  Objetivos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-atm-green transition-colors duration-300" data-testid="footer-link-values">
                  Valores
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-atm-green transition-colors duration-300" data-testid="footer-link-join">
                  Únete
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-atm-green transition-colors duration-300" data-testid="footer-link-contact">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <i className="fas fa-envelope mr-2 text-atm-green"></i>
                <span className="text-sm" data-testid="text-contact-email">contacto@alianzatiradoresmx.org</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone mr-2 text-atm-green"></i>
                <span className="text-sm" data-testid="text-contact-phone">+52 (55) 1234-5678</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2 text-atm-green"></i>
                <span className="text-sm" data-testid="text-contact-address">Ciudad de México, México</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
