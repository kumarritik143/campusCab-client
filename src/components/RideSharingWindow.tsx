"use client";

import React, { useState, useEffect } from "react";

// Define a type for our shared trip object for better type safety
type SharedTrip = {
  status: "OPEN" | "ASSIGNED" | "FULL" | "CLOSED";
  seatsFilled: number;
  capacity: number;
  passengers: { name: string, passengerCount: number }[];
  createdAt: string; // ISO string timestamp from the server
};

type Props = {
  trip: SharedTrip | null;
  yourFare: number | null;
  onCancel: () => void;
};

const RideSharingWindow: React.FC<Props> = ({ trip, yourFare, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState("10:00");

  useEffect(() => {
    if (!trip || !trip.createdAt || trip.status === 'CLOSED' || trip.status === 'FULL') {
      return;
    }

    const interval = setInterval(() => {
      const tripCreationTime = new Date(trip.createdAt).getTime();
      const now = new Date().getTime();
      const tenMinutes = 10 * 1000;
      const elapsedTime = now - tripCreationTime;
      const remainingTime = tenMinutes - elapsedTime;

      if (remainingTime <= 0) {
        setTimeLeft("00:00");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      // Format to always show two digits
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');
      
      setTimeLeft(`${formattedMinutes}:${formattedSeconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [trip]);


  if (!trip) {
    return null;
  }

  const getStatusMessage = () => {
    switch (trip.status) {
      case "OPEN":
      case "ASSIGNED":
        return "Finding other passengers...";
      case "FULL":
        return "Your ride pool is full!";
      case "CLOSED":
        return "Matching window closed. Your ride is starting!";
      default:
        return "Waiting for ride details...";
    }
  };

  return (
    <div className="fixed w-full z-20 bottom-0 bg-white px-6 py-8 shadow-2xl rounded-t-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">
          {getStatusMessage()}
        </h3>
        {/* ✅ Timer Display */}
        {(trip.status === 'OPEN' || trip.status === 'ASSIGNED') && (
            <div className="text-2xl font-bold text-red-500 bg-red-100 px-3 py-1 rounded-lg">
                <i className="ri-time-line mr-2"></i>
                {timeLeft}
            </div>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${(trip.seatsFilled / trip.capacity) * 100}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-lg mb-6">
        <span className="font-semibold text-gray-800">
          <i className="ri-group-fill mr-2"></i>
          Seats Filled: {trip.seatsFilled} / {trip.capacity}
        </span>
        <span className="font-bold text-green-600">
          Your Fare: ₹{yourFare ?? '...'}
        </span>
      </div>

      <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Passengers in this ride:</h4>
          <ul className="list-disc list-inside text-gray-600">
            {trip.passengers.map((p, index) => (
                <li key={index}>{p.name} ({p.passengerCount} {p.passengerCount > 1 ? 'seats' : 'seat'})</li>
            ))}
          </ul>
      </div>
    </div>
  );
};

export default RideSharingWindow;