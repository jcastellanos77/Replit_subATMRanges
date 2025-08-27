import { Shop } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Mail, Globe, MapPin, Star, Clock, Shield, X } from "lucide-react";
import { useState } from "react";

interface ShopCardProps {
  shop: Shop;
}

const categoryColors: Record<string, string> = {
  "Armería": "bg-gray-200 text-atm-green-2",
  "Accesorios": "bg-gray-200 text-atm-green-2",
  "Capacitación": "bg-gray-200 text-atm-green-2",
  "Caza": "bg-gray-200 text-atm-green-2",
  "Municiones": "bg-gray-200 text-atm-green-2",
  "Mantenimiento": "bg-gray-200 text-atm-green-2",
  "Táctico": "bg-gray-200 text-atm-green-2",
  "Uniformes": "bg-gray-200 text-atm-green-2",
  "Protección": "bg-gray-200 text-atm-green-2",
  "Arquería": "bg-gray-200 text-atm-green-2",
  "Ballestas": "bg-gray-200 text-atm-green-2",
  "Competencia": "bg-gray-200 text-atm-green-2",
  "Seguridad": "bg-gray-200 text-atm-green-2",
  "Holsters": "bg-gray-200 text-atm-green-2",
  "Reparación": "bg-gray-200 text-atm-green-2",
  "Certificado": "bg-gray-200 text-atm-green-2",
};

export default function ShopCard({ shop }: ShopCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking map
    window.open(shop.googleMapsUrl, '_blank');
  };

  const handleCardClick = () => {
    setIsExpanded(true);
  };

  const renderIcon = () => {
    // Check if logo is an image URL
    if (shop.logo && (shop.logo.startsWith('/') || shop.logo.startsWith('http'))) {
      return (
        <div className="flex items-center justify-center">
          <img 
            src={shop.logo} 
            alt={`${shop.name} logo`}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              // Fallback to default icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <span className="text-2xl hidden">🏪</span>
        </div>
      );
    }
    
    // Map logo strings to appropriate icons
    const iconMap: Record<string, JSX.Element> = {
      "fas fa-crosshairs": <span className="text-2xl">🎯</span>,
      "fas fa-bullseye": <span className="text-2xl">🎯</span>,
      "fas fa-medal": <span className="text-2xl">🏅</span>,
      "fas fa-bow-arrow": <span className="text-2xl">🏹</span>,
      "fas fa-tools": <span className="text-2xl">🔧</span>,
      "fas fa-shield-alt": <Shield className="w-6 h-6" />,
    };

    return iconMap[shop.logo] || <span className="text-2xl">🏪</span>;
  };

  const getCategoryColorClass = (category: string) => {
    return categoryColors[category] || "bg-gray-200 text-atm-green-2";
  };

  const renderStars = (rating: string | null) => {
    if (!rating) return null;
    
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <>
      {/* Compact Card - Clickable */}
      <Card 
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer" 
        data-testid={`card-shop-${shop.id}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4 lg:p-6">
          {/* Three-Column Layout: Logo | Info | Map */}
          <div className="flex items-start space-x-3 lg:space-x-6">
            {/* Column A: Store Logo (Circular) */}
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              {renderIcon()}
            </div>
            
            {/* Column B: Store Name & Description with Contact Details */}
            <div className="flex-1 space-y-2 lg:space-y-3 min-w-0">
              {/* Store Name and Description */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-atm-dark mb-1 truncate" data-testid={`text-shop-name-${shop.id}`}>
                  {shop.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2" data-testid={`text-shop-description-${shop.id}`}>
                  {shop.description}
                </p>
                <div className="flex items-center text-xs lg:text-sm text-gray-500 mb-2">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate" data-testid={`text-shop-location-${shop.id}`}>
                    {shop.city}, {shop.state}
                  </span>
                </div>
              </div>
              
              {/* Services/Categories */}
              <div className="flex flex-wrap gap-1">
                {shop.categories.slice(0, 3).map((category, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs ${getCategoryColorClass(category)}`}
                    data-testid={`badge-category-${shop.id}-${index}`}
                  >
                    {category}
                  </Badge>
                ))}
                {shop.categories.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-gray-200 text-atm-green-2">
                    +{shop.categories.length - 3}
                  </Badge>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="space-y-1 text-xs lg:text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="w-3 h-3 text-atm-green mr-2 flex-shrink-0" />
                  <span className="truncate" data-testid={`text-shop-phone-${shop.id}`}>{shop.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-3 h-3 text-atm-green mr-2 flex-shrink-0" />
                  <span className="truncate" data-testid={`text-shop-email-${shop.id}`}>{shop.email}</span>
                </div>
                {shop.website && (
                  <div className="flex items-center">
                    <Globe className="w-3 h-3 text-atm-green mr-2 flex-shrink-0" />
                    <a 
                      href={`https://${shop.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-atm-green transition-colors truncate"
                      data-testid={`link-shop-website-${shop.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {shop.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Column C: Static Map Image (Clickable) */}
            <div 
              className="relative w-20 h-20 lg:w-32 lg:h-32 bg-gray-200 rounded-lg group cursor-pointer flex-shrink-0" 
              onClick={handleMapClick}
              data-testid={`button-map-${shop.id}`}
            >
              <img 
                src={shop.mapImageUrl}
                alt={`Ubicación de ${shop.name}`}
                className="w-full h-full object-cover rounded-lg"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-lg">
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-white text-xs font-medium text-center">
                  Ver en Mapa
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Modal Dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid={`dialog-shop-${shop.id}`}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-atm-dark flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                {renderIcon()}
              </div>
              {shop.name}
              {shop.isVerified === "true" && (
                <Badge className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Left Column: Information */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-atm-dark mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{shop.description}</p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-atm-dark mb-2">Ubicación</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-atm-green" />
                  <span>{shop.address}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {shop.city}, {shop.state}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-atm-dark mb-2">Servicios</h3>
                <div className="flex flex-wrap gap-2">
                  {shop.categories.map((category, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={`${getCategoryColorClass(category)}`}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-atm-dark mb-3">Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-atm-green mr-3" />
                    <a href={`tel:${shop.phone}`} className="text-gray-700 hover:text-atm-green transition-colors">
                      {shop.phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-atm-green mr-3" />
                    <a href={`mailto:${shop.email}`} className="text-gray-700 hover:text-atm-green transition-colors">
                      {shop.email}
                    </a>
                  </div>
                  {shop.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-atm-green mr-3" />
                      <a 
                        href={`https://${shop.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-atm-green transition-colors"
                      >
                        {shop.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Images */}
            <div className="space-y-6">
              {/* Shop Logo/Image */}
              {shop.logo && (shop.logo.startsWith('/') || shop.logo.startsWith('http')) && (
                <div>
                  <h3 className="text-lg font-semibold text-atm-dark mb-2">Logo</h3>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                    <img 
                      src={shop.logo} 
                      alt={`${shop.name} logo`}
                      className="max-w-32 max-h-32 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Map Image */}
              <div>
                <h3 className="text-lg font-semibold text-atm-dark mb-2">Ubicación en Mapa</h3>
                <div className="relative">
                  <img 
                    src={shop.mapImageUrl}
                    alt={`Ubicación de ${shop.name}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => window.open(shop.googleMapsUrl, '_blank')}
                    className="absolute bottom-3 right-3 bg-atm-green hover:bg-atm-green-dark text-white"
                    size="sm"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Ver en Google Maps
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
