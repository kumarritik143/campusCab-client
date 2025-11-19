"use client";

import axios from "axios";
import React from "react";

type LatLng = { lat: number; lng: number };

type Suggestion = {
  description: string;
  place_id: string;
  location: LatLng; 
  [key: string]: unknown;
};

type Props = {
  suggestions: Suggestion[];
  setVehiclePanel: (val: boolean) => void;
  setPickup: (val: string) => void;
  setDestination: (val: string) => void;
  setPickupLocation: React.Dispatch<React.SetStateAction<LatLng | null>>;
  setDestinationLocation: React.Dispatch<React.SetStateAction<LatLng | null>>;
  activeField: "pickup" | "destination" | null;
};

const LocationSearchPanel: React.FC<Props> = ({
  suggestions,
  setPickup,
  setDestination,
  setPickupLocation,
  setDestinationLocation,
  activeField,
}) => {
  const handleSuggestionClick = async (suggestion: Suggestion) => {
  // console.log("🖱️ Suggestion Clicked:", suggestion);
  // console.log("Sending Place ID:", suggestion.place_id);
  if (!suggestion.place_id) {
    console.error("No place_id found in suggestion", suggestion);
    alert("Invalid suggestion. Please try again.");
    return;
  }

  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/maps/get-place-details`, {
      params: { place_id: suggestion.place_id },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const location = res.data.location;

    if (activeField === "pickup") {
      setPickup(suggestion.description);
      setPickupLocation(location);
      // console.log("🚕 Pickup Location Set:", location);
    } else if (activeField === "destination") {
      setDestination(suggestion.description);
      setDestinationLocation(location);
      // console.log("🎯 Destination Location Set:", location);
    }

    // setPanelOpen(false);
  } catch (error) {
    console.error("Error fetching place details", error);
    alert("Failed to fetch location details. Please try again.");
  }
};




  return (
    <div>
      {suggestions.map((elem, idx) => (
        <div
          key={idx}
          onClick={() => handleSuggestionClick(elem)}
          className="flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start cursor-pointer"
        >
          <h2 className="bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full">
            <i className="ri-map-pin-fill"></i>
          </h2>
          <h4 className="font-medium">{elem.description}</h4>{" "}
          
        </div>
      ))}
    </div>
  );
};

export default LocationSearchPanel;
