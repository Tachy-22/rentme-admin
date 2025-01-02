import { Property, AmenityItem } from "@/types/property";

const amenities: AmenityItem[] = [
  { id: "1", name: "Wifi", type: "essential", icon: "wifi" },
  { id: "2", name: "Pool", type: "feature", icon: "pool" },
  { id: "3", name: "Security System", type: "safety", icon: "shield" },
  // ...more amenities
];

export const mockProperties: Property[] = [
  {
    id: "2",
    title: "Modern North Gate Apartment",
    description:
      "Stunning waterfront condo with panoramic ocean views and modern amenities",
    price: 300000, // Changed to annual price
    location: {
      address: "FUTA North Gate, Opposite Federal Girls College",
      city: "Akure",
      state: "Ondo",
      country: "Nigeria",
      coordinates: [7.3032, 5.1397],
      lat: 7.3032,
      lng: 5.1397
    },
    specs: {
      beds: 3,
      baths: 2,
      sqft: 1500,
      yearBuilt: 2019,
    },
    amenities: amenities.slice(0, 3),
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",

      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c01",
    ],
    type: "Self contained",
    availableFrom: "2024-03-01",
    pets: true,
    furnished: true,
    parking: true,
    rating: 4.9,
    category: "Apartments",
    host: {
      id: "h1",
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-profile-1",
      isSuperHost: true,
      responseRate: 98,
      responseTime: "within an hour",
      joined: "January 2020",
    },
    reviews: [
      {
        id: "r1",
        rating: 5,
        comment: "Amazing place, great location!",
        date: "2024-01-15",
        author: {
          name: "Sarah Johnson",
          avatar: "https://images.unsplash.com/photo-profile-2",
        },
      },
    ],
    totalReviews: 24,
    ratings: {
      cleanliness: 4.8,
      communication: 4.9,
      checkIn: 4.7,
      accuracy: 4.8,
      location: 4.9,
      value: 4.7,
    },
    policies: {
      moveInDate: "2024-02-01",
      leaseTerms: [
        "One year minimum lease",
        "First month rent and security deposit required",
        "Utilities not included"
      ],
      securityDeposit: 5000,
      paymentSchedule: "yearly",
      utilities: ["Electricity", "Water", "Waste"],
      maintenancePolicy: "24-hour emergency maintenance",
      minLeaseLength: 12,
      maxOccupants: 2
    },
    nearbyPlaces: [
      {
        id: "np1",
        name: "Central Park",
        type: "Park",
        distance: "0.3 miles",
      },
      {
        id: "np2",
        name: "Downtown Mall",
        type: "Shopping",
        distance: "0.5 miles",
      },
    ],
    transitOptions: [
      {
        id: "t1",
        type: "Bus",
        description: "Bus stop 2 blocks away",
      },
      {
        id: "t2",
        type: "Metro",
        description: "Metro station 0.4 miles away",
      },
    ],
    cleaningFee: 75,
    prices: {
      yearlyPrice: 150000,
      leaseLength: 12
    },
    rentTokens: 5,
    contactInfo: {
      phone: "+234 123 456 7890",
      email: "landlord@example.com"
    },
  },

];
