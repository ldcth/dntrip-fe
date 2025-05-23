import React from "react";
import { useDispatch } from "react-redux";
import {
  setSelectedLocation,
  setRouteRequest,
} from "@/redux/slices/map.reducer";
import { AppDispatch } from "@/redux/store/store";
import {
  StructuredPlan,
  // HotelLocation,
  // DailyPlan,
  // RouteStep,
  PlannedStops,
} from "@/types/conversation.types";

interface PlanDisplayProps {
  plan: StructuredPlan;
  showDirectionsMode: boolean;
}

const PlanDisplay = ({ plan, showDirectionsMode }: PlanDisplayProps) => {
  const dispatch = useDispatch<AppDispatch>();

  if (!plan || !plan.daily_plans) {
    return <p>No plan data available to display.</p>;
  }

  const findStopDetails = (
    dayIndex: number,
    stopName: string
  ): { coords: { lat: number; lng: number }; routeIndex: number } | null => {
    const currentDayPlan = plan.daily_plans?.[dayIndex];
    if (!currentDayPlan || !currentDayPlan.route) return null;
    const route = currentDayPlan.route;
    const routeIndex = route.findIndex((step) => step.name === stopName);

    if (routeIndex !== -1) {
      const routeStep = route[routeIndex];
      if (routeStep.coords && routeStep.coords.length === 2) {
        return {
          coords: { lat: routeStep.coords[0], lng: routeStep.coords[1] },
          routeIndex,
        };
      }
    }
    return null;
  };

  const getCoordsFromRouteIndex = (
    dayIndex: number,
    routeIndex: number
  ): { lat: number; lng: number } | null => {
    const currentDayPlan = plan.daily_plans?.[dayIndex];
    const step = currentDayPlan?.route?.[routeIndex];
    if (step && step.coords && step.coords.length === 2) {
      return { lat: step.coords[0], lng: step.coords[1] };
    }
    return null;
  };
  console.log(showDirectionsMode);

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
          <p
            className={`text-md text-gray-700 ${
              plan.hotel.coords
                ? "cursor-pointer hover:text-indigo-600 hover:font-semibold"
                : ""
            }`}
            onClick={() => {
              if (plan.hotel.coords && plan.hotel.coords.length === 2) {
                const hotelCoords = {
                  lat: plan.hotel.coords[0],
                  lng: plan.hotel.coords[1],
                };
                console.log(
                  "PlanDisplay: Clicked Hotel, dispatching setSelectedLocation:",
                  hotelCoords
                );
                dispatch(setSelectedLocation(hotelCoords));
              } else {
                console.warn(
                  "PlanDisplay: Hotel coordinates are invalid or missing."
                );
              }
            }}
            title={
              plan.hotel.coords
                ? `Click to view ${plan.hotel.name} on map`
                : plan.hotel.name
            }
          >
            <span className="font-semibold text-gray-800">Hotel:</span>{" "}
            {plan.hotel.name}
          </p>
          {plan.hotel.description && (
            <p className="text-sm text-gray-600 mt-1 italic">
              {plan.hotel.description}
            </p>
          )}
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
        {plan.daily_plans.map((dayPlan, dayIndex) => (
          <div
            key={dayPlan.day}
            className="border border-blue-200 rounded-lg p-5 bg-white shadow-sm relative overflow-hidden"
            style={{ borderLeft: "5px solid #6366F1" }}
          >
            <h4 className="text-lg font-semibold text-indigo-700 mb-4">
              Day {dayPlan.day}
            </h4>

            {/* Planned Stops  */}
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
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                  });

                return entries.map(([timeSlot, stops]) => (
                  <div key={timeSlot} className="pl-2">
                    <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
                      <p className="text-sm font-semibold capitalize text-indigo-600 mb-1.5">
                        {timeSlot === "Morning" && "🌄 "}
                        {timeSlot === "Lunch" && "🍴 "}
                        {timeSlot === "Afternoon" && "☀️ "}
                        {timeSlot === "Dinner" && "🍴 "}
                        {timeSlot === "Evening" && "🌃 "}
                        {timeSlot}:
                      </p>
                      <ul className="list-disc list-inside pl-3 space-y-1">
                        {stops.map((stop: string, stopIndexInList: number) => {
                          const stopDetails = findStopDetails(dayIndex, stop);
                          const destCoords = stopDetails?.coords;

                          const handleClick = () => {
                            if (!stopDetails) {
                              console.warn(
                                `PlanDisplay: Clicked ${stop}, but no details found in route.`
                              );
                              return;
                            }
                            const currentCoords = stopDetails.coords;
                            const currentRouteIndex = stopDetails.routeIndex;

                            if (showDirectionsMode) {
                              console.log(
                                `PlanDisplay (DIR_MODE): Clicked ${stop} (Route Index: ${currentRouteIndex})`
                              );
                              if (currentRouteIndex > 0) {
                                const originCoords = getCoordsFromRouteIndex(
                                  dayIndex,
                                  currentRouteIndex - 1
                                );
                                console.log(
                                  `PlanDisplay (DIR_MODE): Previous stop coords found:`,
                                  originCoords
                                );
                                if (originCoords) {
                                  console.log(
                                    `PlanDisplay (DIR_MODE): Dispatching setRouteRequest:`,
                                    {
                                      origin: originCoords,
                                      destination: currentCoords,
                                    }
                                  );
                                  dispatch(
                                    setRouteRequest({
                                      origin: originCoords,
                                      destination: currentCoords,
                                    })
                                  );
                                } else {
                                  console.warn(
                                    `PlanDisplay (DIR_MODE): Previous coords were null/invalid. Falling back to setSelectedLocation.`
                                  );
                                  dispatch(setSelectedLocation(currentCoords));
                                }
                              } else {
                                console.log(
                                  `PlanDisplay (DIR_MODE): This is the first stop (index 0). Dispatching setSelectedLocation.`
                                );
                                dispatch(setSelectedLocation(currentCoords));
                              }
                            } else {
                              // Highlight mode
                              console.log(
                                `PlanDisplay (HIGHLIGHT_MODE): Clicked ${stop}, dispatching setSelectedLocation:`,
                                currentCoords
                              );
                              dispatch(setSelectedLocation(currentCoords));
                            }
                          };

                          return (
                            <li
                              key={`${dayPlan.day}-${timeSlot}-${stopIndexInList}`}
                              className={`text-sm text-gray-700 ${
                                destCoords
                                  ? "cursor-pointer hover:text-indigo-600 hover:font-semibold"
                                  : ""
                              }`}
                              onClick={destCoords ? handleClick : undefined}
                              title={
                                destCoords
                                  ? `Click to view ${stop} on map`
                                  : stop
                              }
                            >
                              {stop}
                              {/* Display stop description if available */}
                              {stopDetails?.routeIndex !== undefined &&
                                plan.daily_plans[dayIndex].route[
                                  stopDetails.routeIndex
                                ].description && (
                                  <p className="text-xs text-gray-500 mt-0.5 italic pl-2">
                                    {
                                      plan.daily_plans[dayIndex].route[
                                        stopDetails.routeIndex
                                      ].description
                                    }
                                  </p>
                                )}
                            </li>
                          );
                        })}
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
