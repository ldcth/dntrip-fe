import React from "react";

// --- Plan Data Structures ---

interface Hotel {
  name: string;
  coords: [number, number];
}

interface PlannedStops {
  Morning?: string[];
  Lunch?: string[];
  Afternoon?: string[];
  Dinner?: string[];
  Evening?: string[];
}

interface RouteStep {
  step: number;
  time_slot: string;
  type: "hotel" | "place" | "restaurant"; // Assuming these are the possible types
  name: string;
  coords: [number, number];
  distance_from_previous_km: number;
}

interface DailyPlan {
  day: number;
  planned_stops: PlannedStops;
  route: RouteStep[];
}

export interface StructuredPlan {
  hotel: Hotel;
  daily_plans: DailyPlan[];
}

// --- Plan Display Component ---

interface PlanDisplayProps {
  plan: StructuredPlan;
}

const PlanDisplay = ({ plan }: PlanDisplayProps) => {
  if (!plan) {
    return <p>No plan data available to display.</p>;
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg">
      {/* Hotel Information */}
      <div className="border-b border-blue-200 pb-4 mb-4">
        <h3 className="text-xl font-bold text-indigo-800 mb-2 flex items-center">
          {/* Icon Placeholder */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Accommodation
        </h3>
        <div className="pl-7">
          <p className="text-md text-gray-700">
            <span className="font-semibold text-gray-800">Hotel:</span>{" "}
            {plan.hotel.name}
          </p>
          {/* Optionally display hotel coords if needed */}
          {/* <p className="text-xs text-gray-500">Coords: {plan.hotel.coords.join(', ')}</p> */}
        </div>
      </div>

      {/* Daily Plans */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-indigo-800 mb-3 flex items-center">
          {/* Icon Placeholder */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Daily Itinerary
        </h3>
        {plan.daily_plans.map((dayPlan) => (
          <div
            key={dayPlan.day}
            className="border border-blue-200 rounded-lg p-5 bg-white shadow-sm relative overflow-hidden"
            // Add a subtle accent border
            style={{ borderLeft: "5px solid #6366F1" /* indigo-500 */ }}
          >
            <h4 className="text-lg font-semibold text-indigo-700 mb-4">
              Day {dayPlan.day}
            </h4>

            {/* Planned Stops (Improved View) */}
            <div className="space-y-3">
              <h5 className="text-md font-medium text-gray-700 mb-2 border-b pb-1">
                Planned Stops:
              </h5>
              {(() => {
                const timeSlotOrder: (keyof PlannedStops)[] = [
                  "Morning",
                  "Lunch",
                  "Afternoon",
                  "Dinner",
                  "Evening",
                ];
                const entries = Object.entries(dayPlan.planned_stops)
                  .filter(([, stops]) => stops && stops.length > 0)
                  .sort(([timeSlotA], [timeSlotB]) => {
                    const indexA = timeSlotOrder.indexOf(
                      timeSlotA as keyof PlannedStops
                    );
                    const indexB = timeSlotOrder.indexOf(
                      timeSlotB as keyof PlannedStops
                    );
                    // Handle cases where a timeSlot might not be in our defined order (shouldn't happen with current structure)
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                  });

                return entries.map(([timeSlot, stops]) => (
                  <div key={timeSlot} className="pl-2">
                    {/* Added background and rounded corners to group time slot stops */}
                    <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
                      <p className="text-sm font-semibold capitalize text-indigo-600 mb-1.5">
                        {/* Icon Placeholder based on time */}
                        {timeSlot === "Morning" && "🌄 "}
                        {timeSlot === "Lunch" && "🍴 "}
                        {timeSlot === "Afternoon" && "☀️ "}
                        {timeSlot === "Dinner" && "🍴 "}
                        {timeSlot === "Evening" && "🌃 "}
                        {timeSlot}:
                      </p>
                      <ul className="list-disc list-inside pl-3 space-y-1">
                        {stops.map((stop: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">
                            {stop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Route Details (Optional - can be more detailed later) */}
            {/* Example: Displaying route steps simply */}
            {/* <div className="mt-2 border-t pt-2">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Route:</h5>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {dayPlan.route.map((step) => (
                  <li key={step.step} className="text-xs text-gray-600">
                    {step.time_slot} ({step.type}): {step.name} ({step.distance_from_previous_km.toFixed(2)} km)
                  </li>
                ))}
              </ul>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanDisplay;
