import { fetchCollection } from "@/actions/fetchCollection";
import PropertyForm from "@/components/forms/PropertyForm";
import PropertiesTable from "@/components/tables/PropertiesTable";
// import PropertyTables from "@/components/tables/PropertyTables";

import React from "react";

const page = async () => {
  const propertiesData = await fetchCollection("properties");

  if ("code" in propertiesData) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-6 mt-[3rem]">
      <div className="grid px-[1rem] grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Properties</h2>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                Total Properties: {propertiesData.count}
              </div>
            </div>
            {/* <PropertiesTable data={propertiesData} /> */}
            <PropertiesTable data={propertiesData.items as { id: number; title: string; location: { address: string }; price: number; status: string }[]} />
          </div>
          {/* <PropertyTables /> */}
        </div>
        <div className="md:col-span-1">
          <PropertyForm />
        </div>
      </div>
    </div>
  );
};

export default page;
