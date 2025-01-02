"use client";
import React from "react";
// import { MapContainer, TileLayer, Marker } from "react-leaflet";
// // import { geocode } from "nominatim-browser";
// import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
//import L from "leaflet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { addDocument } from "@/actions/addDocument";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FileInput, FileMetadata } from "@/components/ui/FileInput";
// import { Loader2 } from "lucide-react";
// import {
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
//   Command,
// } from "@/components/ui/command";

// Fix Leaflet default marker icon
// const icon = L.icon({
//   iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

const PROPERTY_TYPES = [
  "Self contained",
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Studio",
];

const CATEGORIES = [
  "Apartments",
  "Houses",
  "Condos",
  "Villas",
  "Commercial",
  "Student Housing",
];

const PAYMENT_SCHEDULES = ["monthly", "quarterly", "biannually", "yearly"];

const UTILITIES = [
  "Electricity",
  "Water",
  "Gas",
  "Internet",
  "Cable TV",
  "Waste",
];

const AMENITIES = [
  { id: "1", name: "Wifi", type: "essential", icon: "wifi" },
  { id: "2", name: "Pool", type: "feature", icon: "pool" },
  { id: "3", name: "Security System", type: "safety", icon: "shield" },
  { id: "4", name: "Air Conditioning", type: "comfort", icon: "ac" },
  { id: "5", name: "Gym", type: "feature", icon: "gym" },
  { id: "6", name: "Laundry", type: "essential", icon: "laundry" },
];

const formSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  type: z.string(),
  price: z.coerce.number().min(0),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    coordinates: z.array(z.number()).length(2),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  }),
  specs: z.object({
    beds: z.coerce.number().min(0),
    baths: z.coerce.number().min(0),
    sqft: z.coerce.number().min(0),
    yearBuilt: z.coerce.number(),
  }),
  amenities: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      icon: z.string(),
    })
  ),
  images: z.array(z.string()),
  availableFrom: z.string(),
  pets: z.boolean(),
  furnished: z.boolean(),
  parking: z.boolean(),
  rating: z.number().optional(),
  category: z.string(),
  host: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string(),
    isSuperHost: z.boolean(),
    responseRate: z.number(),
    responseTime: z.string(),
    joined: z.string(),
  }),
  policies: z.object({
    moveInDate: z.string(),
    leaseTerms: z.array(z.string()),
    securityDeposit: z.coerce.number(),
    paymentSchedule: z.string(),
    utilities: z.array(z.string()),
    maintenancePolicy: z.string(),
    minLeaseLength: z.coerce.number(),
    maxOccupants: z.coerce.number(),
  }),
  prices: z.object({
    yearlyPrice: z.coerce.number(),
    leaseLength: z.coerce.number(),
  }),
  rentTokens: z.coerce.number(),
  contactInfo: z.object({
    phone: z.string(),
    email: z.string(),
  }),
});

const PropertyForm = () => {
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([
    9.082, 8.6753,
  ]); // Nigeria center
  console.log({ mapCenter });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      price: 0,
      location: {
        address: "",
        city: "",
        state: "",
        country: "Nigeria",
        coordinates: [0, 0],
        lat: 0,
        lng: 0,
      },
      specs: {
        beds: 0,
        baths: 0,
        sqft: 0,
        yearBuilt: new Date().getFullYear(),
      },
      amenities: [],
      images: [],
      availableFrom: new Date().toISOString().split("T")[0],
      pets: false,
      furnished: false,
      parking: false,
      category: "Apartments",
      host: {
        id: "h1", // You might want to get this from your auth system
        name: "",
        avatar: "",
        isSuperHost: false,
        responseRate: 0,
        responseTime: "within a day",
        joined: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      },
      policies: {
        moveInDate: new Date().toISOString().split("T")[0],
        leaseTerms: [],
        securityDeposit: 0,
        paymentSchedule: "yearly",
        utilities: [],
        maintenancePolicy: "",
        minLeaseLength: 12,
        maxOccupants: 1,
      },
      prices: {
        yearlyPrice: 0,
        leaseLength: 12,
      },
      rentTokens: 0,
      contactInfo: {
        phone: "",
        email: "",
      },
    },
  });

  // Add this function to update map when coordinates change
  const updateMap = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    form.setValue("location.coordinates", [lat, lng]);
    form.setValue("location.lat", lat);
    form.setValue("location.lng", lng);
  };

  const handleImagesUpload = (files: FileMetadata[]) => {
    form.setValue(
      "images",
      files.map((file) => file.url)
    );
  };

  const handleAvatarUpload = (files: FileMetadata[]) => {
    if (files.length > 0) {
      form.setValue("host.avatar", files[0].url);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await addDocument("properties", values, "/properties");
    if ("code" in result) {
      // Handle error
      console.error(result.message);
    } else {
      // Handle success
      console.log("Property added successfully:", result.id);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Title</FormLabel>
              <FormControl>
                <Input placeholder="Modern Apartment..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the property..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location.lat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        updateMap(
                          parseFloat(e.target.value),
                          form.getValues("location.lng")
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.lng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        updateMap(
                          form.getValues("location.lat"),
                          parseFloat(e.target.value)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* <div className="h-[400px] w-full">
          <MapContainer
            center={mapCenter as LatLngExpression}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapCenter} icon={icon} />
           <MapPreview />
          </MapContainer>
        </div> */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="specs.beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specs.baths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (₦)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Images</FormLabel>
              <FormControl>
                <FileInput
                  multiple
                  accept="image/*"
                  maxSize={5}
                  onUploadComplete={handleImagesUpload}
                  initialFiles={field.value}
                  onError={(error) => console.error(error)}
                />
              </FormControl>
              <FormDescription>
                Upload up to 10 images of your property (max 5MB each)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="furnished"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Furnished</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parking</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pets Allowed</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="host.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="host.avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host Avatar</FormLabel>
                <FormControl>
                  <FileInput
                    accept="image/*"
                    maxSize={2}
                    onUploadComplete={handleAvatarUpload}
                    initialFiles={field.value ? [field.value] : []}
                    onError={(error) => console.error(error)}
                  />
                </FormControl>
                <FormDescription>
                  Upload a profile picture (max 2MB)
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="amenities"
          render={() => (
            <FormItem>
              <FormLabel>Amenities</FormLabel>
              <div className="grid grid-cols-3 gap-4">
                {AMENITIES.map((amenity) => (
                  <FormField
                    key={amenity.id}
                    control={form.control}
                    name="amenities"
                    render={({ field }) => {
                      const currentValue = Array.isArray(field.value)
                        ? field.value
                        : [];

                      return (
                        <FormItem
                          key={amenity.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={currentValue.some(
                                (a) => a.id === amenity.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...currentValue, amenity]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (a) => a.id !== amenity.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {amenity.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="policies.utilities"
          render={() => (
            <FormItem>
              <FormLabel>Included Utilities</FormLabel>
              <div className="grid grid-cols-3 gap-4">
                {UTILITIES.map((utility) => (
                  <FormField
                    key={utility}
                    control={form.control}
                    name="policies.utilities"
                    render={({ field }) => {
                      const currentValue = Array.isArray(field.value)
                        ? field.value
                        : [];

                      return (
                        <FormItem
                          key={utility}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={currentValue.includes(utility)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...currentValue, utility]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (item) => item !== utility
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {utility}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="policies.paymentSchedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Schedule</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment schedule" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_SCHEDULES.map((schedule) => (
                    <SelectItem key={schedule} value={schedule}>
                      {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="policies.minLeaseLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Lease Length (months)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="policies.maxOccupants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Occupants</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="rentTokens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rent Tokens Required</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Number of tokens required to rent this property
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="policies.securityDeposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Security Deposit (₦)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactInfo.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactInfo.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Add Property</Button>
      </form>
    </Form>
  );
};

export default PropertyForm;
