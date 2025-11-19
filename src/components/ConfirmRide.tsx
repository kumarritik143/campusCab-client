"use client";

import Image from "next/image";
import React, { useContext } from "react";
import { SocketContext } from "@/context/SocketContext";

type Props = {
  setConfirmRidePanel: (val: boolean) => void;
  // ✅ Modified createRide and added passengerCount
  createRide: (passengerCount: number) => Promise<{ _id: string }>;
  passengerCount: number;
  pickup: string;
  destination: string;
  fare: {
    auto?: number;
  };
  vehicleType: "auto";
};

const ConfirmRide: React.FC<Props> = ({
  setConfirmRidePanel,
  createRide,
  passengerCount, // ✅ Destructure
  pickup,
  destination,
  fare,
  vehicleType,
}) => {

  const contextSocket = useContext(SocketContext);
  const socket = contextSocket?.socket;

  const handleConfirmRide = async () => {
    try {
      // ✅ Pass passenger count to the createRide function
      const ride = await createRide(passengerCount);
      console.log("Ride created:", ride);

      if (socket) {
        // ✅ Pass passenger count in the socket event
        socket.emit("create-ride-sharing", {
          rideId: ride._id,
          pickup,
          destination,
          vehicleType,
          userId: localStorage.getItem("userId"),
          name: localStorage.getItem("username") || "User",
          phone: localStorage.getItem("phone") || "0000000000",
          passengerCount,
        });
      }

      // This will be controlled by socket events now, but we keep it for initial UI change
      setConfirmRidePanel(false);

    } catch (err) {
      console.error("Error confirming ride:", err);
      alert("Failed to confirm ride.");
    }
  };

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => setConfirmRidePanel(false)}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-2xl font-semibold mb-5">Confirm your Ride</h3>

      <div className="flex gap-2 justify-between flex-col items-center">
        <Image
          className="h-20"
          src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
          alt="vehicle"
          width={160}
          height={180}
          unoptimized={true}
        />

        <div className="w-full mt-5">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h3 className="text-lg font-medium">Pickup</h3>
              <p className="text-sm -mt-1 text-gray-600">{pickup}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className="text-lg font-medium">Destination</h3>
              <p className="text-sm -mt-1 text-gray-600">{destination}</p>
            </div>
          </div>
          
          {/* ✅ Display passenger count */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-group-fill"></i>
            <div>
              <h3 className="text-lg font-medium">Passengers</h3>
              <p className="text-sm -mt-1 text-gray-600">{passengerCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-3">
            <i className="ri-currency-line"></i>
            <div>
              <h3 className="text-lg font-medium">₹{fare[vehicleType] ?? "-"}</h3>
              <p className="text-sm -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirmRide}
          className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;