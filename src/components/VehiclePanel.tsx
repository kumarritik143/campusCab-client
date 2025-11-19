"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

type Props = {
  setVehiclePanel: (val: boolean) => void;
  setConfirmRidePanel: (val: boolean) => void;
  selectVehicle: (vehicle: "auto") => void;
  fare: {
    auto?: number;
  };
  setPassengerCount: (count: number) => void; // ✅ Add this prop
};

const VehiclePanel: React.FC<Props> = ({
  setVehiclePanel,
  setConfirmRidePanel,
  selectVehicle,
  fare,
  setPassengerCount, // ✅ Destructure it
}) => {
  // ✅ Renamed to avoid prop conflict
  const [localPassengerCount, setLocalPassengerCount] = useState<number>(1);

  // ✅ Add this useEffect to notify the parent component of changes
  useEffect(() => {
    if(localPassengerCount > 0) {
      setPassengerCount(localPassengerCount);
    }
  }, [localPassengerCount, setPassengerCount]);


  const handleVehicleSelect = () => {
    if (localPassengerCount > 4) {
      alert("Maximum 4 passengers allowed.");
      return;
    }
    if (localPassengerCount < 1) {
      alert("At least 1 passenger required.");
      return;
    }

    selectVehicle("auto");
    setVehiclePanel(false);
    setConfirmRidePanel(true);
  };

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => setVehiclePanel(false)}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-2xl font-semibold mb-5">Choose a Vehicle</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Passengers (1-4)
        </label>
        <input
          type="number"
          value={localPassengerCount === 0 ? "" : localPassengerCount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value, 10);
            if (isNaN(value)) {
              setLocalPassengerCount(0);
              return;
            }
            if (value > 4) {
              setLocalPassengerCount(4);
              return;
            }
            setLocalPassengerCount(value);
          }}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Enter 1-4"
          min="1"
          max="4"
        />
      </div>

      <div
        onClick={handleVehicleSelect}
        className="flex border-2 active:border-black mb-2 rounded-xl w-full p-3 items-center justify-between cursor-pointer"
      >
        <Image
          width={80}
          height={100}
          className="h-10"
          src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
          alt="UberAuto"
          unoptimized={true}
        />
        <div className="ml-2 w-1/2">
          <h4 className="font-medium text-base">
            UberAuto{" "}
            <span>
              <i className="ri-user-3-fill"></i> {localPassengerCount > 0 ? localPassengerCount : '...'}
            </span>
          </h4>
          <h5 className="font-medium text-sm">3 mins away</h5>
          <p className="font-normal text-xs text-gray-600">
            Affordable Auto rides
          </p>
        </div>
        <h2 className="text-lg font-semibold">₹{fare.auto ?? "-"}</h2>
      </div>
    </div>
  );
};

export default VehiclePanel;