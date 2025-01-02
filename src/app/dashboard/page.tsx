import Dashboard from "@/components/layout/Dashboard";
import { fetchCollection } from "@/actions/fetchCollection";
import React from "react";

const page = async () => {
  const waitlistData = await fetchCollection("waitlist");

  if ("code" in waitlistData) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="container mx-auto py-10 mt-[3rem]">
      <Dashboard
        waitlistData={
          waitlistData.items as {
            id: number;
            name: string;
            email: string;
            joinedDate: string;
            createdAt: string;
          }[]
        }
      />
    </div>
  );
};

export default page;
