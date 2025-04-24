import React from "react";

// --- Flight Data Structures ---
// Export FlightData as it's used as a prop type
export interface FlightData {
  id: string; // Corresponds to flight_id
  departure: string; // Corresponds to departure_time
  arrival: string; // Corresponds to arrival_time
  duration: string; // Corresponds to flight_time
  price: string; // Corresponds to price
  date?: string; // Optional new field
  departure_airport?: string; // Optional new field
  arrival_airport?: string; // Optional new field
}

// Interface for raw flight data from API (used internally by ChatInterface)
// No need to export this unless used elsewhere

// --- Flight Table Component ---
interface FlightTableProps {
  flights: FlightData[];
}

const FlightTable = ({ flights }: FlightTableProps) => {
  if (!flights || flights.length === 0) {
    return <p>No flight data available to display.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Flight ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departure
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Arrival
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {flights.map((flight, index) => (
            <tr key={index}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.id}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.departure}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.arrival}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.duration}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {flight.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlightTable;
