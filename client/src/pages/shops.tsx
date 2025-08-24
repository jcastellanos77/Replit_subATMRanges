import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shop } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopFilters from "@/components/ShopFilters";
import ShopCard from "@/components/ShopCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const { data: shops = [], isLoading } = useQuery<Shop[]>({
    queryKey: ["/api/shops"],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/shops/categories"],
  });

  const { data: cities = [] } = useQuery<string[]>({
    queryKey: ["/api/shops/cities"],
  });

  const { data: states = [] } = useQuery<string[]>({
    queryKey: ["/api/shops/states"],
  });

  const filteredShops = useMemo(() => {
    let filtered = shops;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(shop => 
        shop.name.toLowerCase().includes(searchLower) ||
        shop.description.toLowerCase().includes(searchLower) ||
        shop.city.toLowerCase().includes(searchLower) ||
        shop.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(shop => 
        shop.categories.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    if (selectedCity && selectedCity !== "all") {
      filtered = filtered.filter(shop => 
        shop.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    if (selectedState && selectedState !== "all") {
      filtered = filtered.filter(shop => 
        shop.state.toLowerCase() === selectedState.toLowerCase()
      );
    }

    return filtered;
  }, [shops, searchQuery, selectedCategory, selectedCity, selectedState]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <ShopFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        categories={categories}
        cities={cities}
        states={states}
        resultsCount={filteredShops.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-18" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No se encontraron tiendas</div>
            <div className="text-gray-400">
              Intenta ajustar tus filtros de búsqueda
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
