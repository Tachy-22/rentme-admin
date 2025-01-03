"use client";
import React from "react";
import WaitlistTable from "../tables/WaitlistTable";
import WaitlistGraph from "../graphs/WaitlistGraph";

interface DashboardProps {
  waitlistData: {
    id: number;
    name: string;
    email: string;
    joinedDate: string;
    createdAt: string;
  }[];
}

const Dashboard = ({ waitlistData }: DashboardProps) => {
  return (
    <div className="space-y-8 container mx-auto py-[2rem]">
      <div className="flex flex-col gap-10 px-3">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <div className="bg-blue-100 text-blue-800 font-semibold px-6 py-3 rounded-lg shadow-sm">
            Total Waitlisters: {waitlistData.length}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Waitlist Growth Over Time
          </h2>
          <WaitlistGraph data={waitlistData} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Waitlist Members
          </h2>
          <WaitlistTable data={waitlistData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
