export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: [number, number];
    lat?: number; // Add optional lat/lng for map
    lng?: number;
  };
  specs: {
    beds: number;
    baths: number;
    sqft: number;
    yearBuilt: number;
  };
  amenities: AmenityItem[]; // Update from string[] to AmenityItem[]
  images: string[];
  type: 'Self contained' | 'Single room' | '2 bedroom' | '3 bedroom' | 'Shop';
  availableFrom: string;
  pets: boolean;
  furnished: boolean;
  parking: boolean;
  rating: number;
 // reviewsCount: number;
  category: string;
  host: {
    id: string;
    name: string;
    avatar: string;
    isSuperHost: boolean;
    responseRate: number;
    responseTime: string;
    joined: string;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string;
    date: string;
    author: {
      name: string;
      avatar: string;
    };
  }[];
  totalReviews: number;
  ratings: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
  policies: {
    moveInDate: string;
    leaseTerms: string[];
    securityDeposit: number;
    paymentSchedule: 'monthly' | 'quarterly' | 'yearly';
    utilities: string[];
    maintenancePolicy: string;
    minLeaseLength: number;
    maxOccupants: number;
  };
  nearbyPlaces: {
    id: string;
    name: string;
    type: string;
    distance: string;
  }[];
  transitOptions: {
    id: string;
    type: string;
    description: string;
  }[];
  cleaningFee: number;
  prices: {
    yearlyPrice: number;  // Changed from basePrice
   // monthlyPrice: number; // Changed from weekend
    leaseLength: number;  // Minimum lease length in months
  };
 // maxGuests: number; // Add missing property
  rentTokens: number; // Number of tokens required to view contact
  contactInfo?: {
    phone: string;
    email: string;
  };
}

export interface AmenityItem {
  id: string;
  name: string;
  type: 'essential' | 'feature' | 'safety' | 'location';
  icon?: string;
}

export interface MapLocation {
  lat: number;
  lng: number;
  zoom?: number;
}

// Update component props interfaces
export interface ComponentProps {
  ReviewsSectionProps: {
    reviews: Property['reviews'];
    rating: number;
    totalReviews: number;
  };

  LocationSectionProps: {
    location: Property['location'];
    nearbyPlaces: Property['nearbyPlaces'];
    transitOptions: Property['transitOptions'];
  };

  BookingCardProps: {
    property: Property;
    selectedDates: Date[];
    setSelectedDates: (dates: Date[]) => void;
  };

  PriceBreakdownProps: {
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
    nightsCount: number;
  };

  AmenitiesSectionProps: {
    amenities: AmenityItem[];
  };

  PoliciesSectionProps: {
    policies: Property['policies'];
  };

  SimilarPropertiesProps: {
    currentProperty: Property;
    category: string;
  };

  PropertyCardProps: {
    property: Property;
    layout?: 'grid' | 'list';
  };
}

export interface SearchFilters {
  priceRange: [number, number];
  propertyType: string[];
  beds: number;
  baths: number;
  amenities: AmenityItem[];
  pets: boolean;
  furnished: boolean;
  parking: boolean;
}