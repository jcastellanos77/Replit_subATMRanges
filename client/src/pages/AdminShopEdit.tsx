import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import ShopForm from '@/components/ShopForm';

type Shop = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website?: string;
  categories: string[];
  logoUrl: string;
  mapImageUrl: string;
  googleMapsUrl: string;
  isVerified: string;
};

export default function AdminShopEdit() {
  const { id } = useParams();
  
  const { data: shop, isLoading, error } = useQuery<Shop>({
    queryKey: ['/api/shops', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Found</h2>
          <p className="text-gray-500">The shop you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return <ShopForm shop={shop} />;
}