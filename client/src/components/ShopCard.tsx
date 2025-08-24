import { Shop } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Globe, MapPin, Star, Clock, Shield } from "lucide-react";

interface ShopCardProps {
  shop: Shop;
}

const categoryColors: Record<string, string> = {
  "Armería": "bg-atm-green bg-opacity-10 text-atm-green",
  "Accesorios": "bg-blue-100 text-blue-700",
  "Capacitación": "bg-purple-100 text-purple-700",
  "Caza": "bg-atm-green bg-opacity-10 text-atm-green",
  "Municiones": "bg-orange-100 text-orange-700",
  "Mantenimiento": "bg-gray-100 text-gray-700",
  "Táctico": "bg-atm-green bg-opacity-10 text-atm-green",
  "Uniformes": "bg-indigo-100 text-indigo-700",
  "Protección": "bg-yellow-100 text-yellow-700",
  "Arquería": "bg-atm-green bg-opacity-10 text-atm-green",
  "Ballestas": "bg-teal-100 text-teal-700",
  "Competencia": "bg-pink-100 text-pink-700",
  "Seguridad": "bg-red-100 text-red-700",
  "Holsters": "bg-blue-100 text-blue-700",
  "Reparación": "bg-gray-100 text-gray-700",
  "Certificado": "bg-green-100 text-green-700",
};

export default function ShopCard({ shop }: ShopCardProps) {
  const handleMapClick = () => {
    window.open(shop.googleMapsUrl, '_blank');
  };

  const renderIcon = () => {
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
    return categoryColors[category] || "bg-gray-100 text-gray-700";
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
    <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden" data-testid={`card-shop-${shop.id}`}>
      <CardContent className="p-6">
        {/* Shop Logo and Info */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {renderIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-atm-dark mb-1" data-testid={`text-shop-name-${shop.id}`}>
              {shop.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2" data-testid={`text-shop-description-${shop.id}`}>
              {shop.description}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span data-testid={`text-shop-location-${shop.id}`}>
                {shop.city}, {shop.state}
              </span>
            </div>
          </div>
        </div>
        
        {/* Services/Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
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
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
              +{shop.categories.length - 3} más
            </Badge>
          )}
        </div>
        
        {/* Contact Info */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Phone className="w-4 h-4 text-atm-green mr-2" />
            <span data-testid={`text-shop-phone-${shop.id}`}>{shop.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 text-atm-green mr-2" />
            <span data-testid={`text-shop-email-${shop.id}`}>{shop.email}</span>
          </div>
          {shop.website && (
            <div className="flex items-center">
              <Globe className="w-4 h-4 text-atm-green mr-2" />
              <a 
                href={`https://${shop.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-atm-green transition-colors"
                data-testid={`link-shop-website-${shop.id}`}
              >
                {shop.website}
              </a>
            </div>
          )}
          {shop.hours && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-atm-green mr-2" />
              <span data-testid={`text-shop-hours-${shop.id}`}>{shop.hours}</span>
            </div>
          )}
          {shop.rating && renderStars(shop.rating)}
        </div>
      </CardContent>
      
      {/* Map Image */}
      <div 
        className="relative h-32 bg-gray-200 group cursor-pointer" 
        onClick={handleMapClick}
        data-testid={`button-map-${shop.id}`}
      >
        <img 
          src={shop.mapImageUrl}
          alt={`Ubicación de ${shop.name}`}
          className="w-full h-full object-cover"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
          <Button 
            className="bg-atm-green hover:bg-green-600 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            Ver en Mapa
          </Button>
        </div>
      </div>
    </Card>
  );
}
