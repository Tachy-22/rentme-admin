"use client";
import React from "react";
import "leaflet/dist/leaflet.css";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Rating } from "@/components/ui/rating";

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

const PLACE_TYPES = [
  "Park",
  "Shopping",
  "Restaurant",
  "School",
  "Hospital",
  "Gym",
  "Market",
];

const TRANSIT_TYPES = ["Bus", "Metro", "Taxi", "Bike", "Walk"];

const LEASE_TERMS = [
  "One year minimum lease",
  "First month rent and security deposit required",
  "Utilities not included",
  "No smoking",
  "Background check required",
  "Income verification required",
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
  nearbyPlaces: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        distance: z.string(),
      })
    )
    .optional(),
  transitOptions: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
      })
    )
    .optional(),
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
      transitOptions: [],
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

  const [nearbyPlaces, setNearbyPlaces] = React.useState<
    { name: string; type: string; distance: string }[]
  >([]);

  const [transitOptions, setTransitOptions] = React.useState<
    { type: string; description: string }[]
  >([]);

  const addNearbyPlace = () => {
    setNearbyPlaces([
      ...nearbyPlaces,
      { name: "", type: PLACE_TYPES[0], distance: "" },
    ]);
  };

  const addTransitOption = () => {
    setTransitOptions([
      ...transitOptions,
      { type: TRANSIT_TYPES[0], description: "" },
    ]);
  };

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

        {/* Add Move-in Date with Calendar */}
        <FormField
          control={form.control}
          name="policies.moveInDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Move-in Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(field.value)}
                    onSelect={(date) =>
                      field.onChange(date?.toISOString().split("T")[0])
                    }
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lease Terms */}
        <FormField
          control={form.control}
          name="policies.leaseTerms"
          render={() => (
            <FormItem>
              <FormLabel>Lease Terms</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {LEASE_TERMS.map((term) => (
                  <FormField
                    key={term}
                    control={form.control}
                    name="policies.leaseTerms"
                    render={({ field }) => {
                      const currentValue = Array.isArray(field.value)
                        ? field.value
                        : [];

                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={currentValue.includes(term)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...currentValue, term]);
                                } else {
                                  field.onChange(
                                    currentValue.filter((item) => item !== term)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{term}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />

        {/* Nearby Places */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Nearby Places</FormLabel>
            <Button type="button" variant="outline" onClick={addNearbyPlace}>
              <Plus className="w-4 h-4 mr-2" /> Add Place
            </Button>
          </div>
          {nearbyPlaces.map((_, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-end">
              <Input
                placeholder="Place name"
                value={nearbyPlaces[index].name}
                onChange={(e) => {
                  const updated = [...nearbyPlaces];
                  updated[index].name = e.target.value;
                  setNearbyPlaces(updated);
                  form.setValue("nearbyPlaces", updated);
                }}
              />
              <Select
                value={nearbyPlaces[index].type}
                onValueChange={(value) => {
                  const updated = [...nearbyPlaces];
                  updated[index].type = value;
                  setNearbyPlaces(updated);
                  form.setValue("nearbyPlaces", updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {PLACE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Distance"
                  value={nearbyPlaces[index].distance}
                  onChange={(e) => {
                    const updated = [...nearbyPlaces];
                    updated[index].distance = e.target.value;
                    setNearbyPlaces(updated);
                    form.setValue("nearbyPlaces", updated);
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    const updated = nearbyPlaces.filter((_, i) => i !== index);
                    setNearbyPlaces(updated);
                    form.setValue("nearbyPlaces", updated);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Transit Options */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Getting Around</FormLabel>
            <Button type="button" variant="outline" onClick={addTransitOption}>
              <Plus className="w-4 h-4 mr-2" /> Add Transit Option
            </Button>
          </div>
          {transitOptions.map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 items-end">
              <Select
                value={transitOptions[index].type}
                onValueChange={(value) => {
                  const updated = [...transitOptions];
                  updated[index].type = value;
                  setTransitOptions(updated);
                  form.setValue("transitOptions", updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSIT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Description"
                  value={transitOptions[index].description}
                  onChange={(e) => {
                    const updated = [...transitOptions];
                    updated[index].description = e.target.value;
                    setTransitOptions(updated);
                    form.setValue("transitOptions", updated);
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    const updated = transitOptions.filter(
                      (_, i) => i !== index
                    );
                    setTransitOptions(updated);
                    form.setValue("transitOptions", updated);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Rating */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Rating</FormLabel>
              <FormControl>
                <Rating
                  value={field.value || 0}
                  onChange={field.onChange}
                  max={5}
                  precision={0.1}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Add Property</Button>
      </form>
    </Form>
  );
};

export default PropertyForm;
