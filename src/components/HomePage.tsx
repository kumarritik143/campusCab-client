"use client";

import { useGSAP } from "@gsap/react";
import axios from "axios";
import gsap from "gsap";
import React, { useContext, useEffect, useRef, useState } from "react";
import "remixicon/fonts/remixicon.css";
import Image from "next/image";
import dynamic from "next/dynamic";

import ConfirmRide from "@/components/ConfirmRide";
import LocationSearchPanel from "@/components/LocationSearchPanel";
import LookingForDriver from "@/components/LookingForDriver";
import RideConfirmation from "@/components/RideConfirmation";
import VehiclePanel from "@/components/VehiclePanel";
import RideSharingWindow from "@/components/RideSharingWindow";
import { SocketContext } from "@/context/SocketContext";
import { UserDataContext } from "@/context/UserContext";
import {
  SharedTrip,
  RideNotificationPayload,
} from "@/types/rideSharing";

const LiveTracking = dynamic(() => import("@/components/LiveTracking"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

// Type definitions
type Fare = { [key: string]: number; };
type VehicleType = "auto";
type Suggestion = {
  description: string;
  place_id: string;
  location: { lat: number; lng: number };
  [key: string]: unknown;
};
type Ride = {
  _id: string;
  pickup: string;
  destination: string;
  [key: string]: unknown;
};
type LatLng = { lat: number; lng: number };

const Home: React.FC = () => {
  // State for UI and ride details
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [rideConfirmed, setRideConfirmed] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [pickupLocation, setPickupLocation] = useState<LatLng | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LatLng | null>(null);
  const [activeField, setActiveField] = useState<"pickup" | "destination" | null>(null);
  const [fare, setFare] = useState<Fare>({});
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [ride, setRide] = useState<Ride | null>(null);
  const [showRoute, setShowRoute] = useState(false);

  // State for ride pooling
  const [passengerCount, setPassengerCount] = useState(1);
  const [showRideSharingWindow, setShowRideSharingWindow] = useState(false);
  const [sharedTrip, setSharedTrip] = useState<SharedTrip | null>(null);
  const [yourFare, setYourFare] = useState<number | null>(null);

  // Refs for GSAP animations
  const panelRef = useRef<HTMLDivElement>(null);
  const panelCloseRef = useRef<HTMLHeadingElement>(null);
  const vehiclePanelRef = useRef<HTMLDivElement>(null);
  const confirmRidePanelRef = useRef<HTMLDivElement>(null);
  const vehicleFoundRef = useRef<HTMLDivElement>(null);
  const RideConfirmationRef = useRef<HTMLDivElement>(null);

  // Contexts
  const contextSocket = useContext(SocketContext);
  const socket = contextSocket?.socket;
  const userContext = useContext(UserDataContext);
  if (!userContext) throw new Error("UserContext is undefined");
  const { user } = userContext;

  // Socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    const handleRideAccepted = (data: Ride) => {
      console.log("Ride Accepted Event Received:", data);
      setVehicleFound(false);
      setShowRideSharingWindow(false);
      setSharedTrip(null);
      setRide(data);
      setRideConfirmed(true);
    };

    const handleRideRejected = (data: RideNotificationPayload) => {
      console.log("Ride Rejected Event Received:", data);
      setVehicleFound(false);
      alert("Driver has rejected your ride.");
    };

    const handleSharedRideCreated = (data: { trip: SharedTrip; yourFare: number }) => {
      console.log("Shared ride created:", data);
      setSharedTrip(data.trip);
      setYourFare(data.yourFare);
      setShowRideSharingWindow(true);
      setConfirmRidePanel(false);
    };

    const handleSharedRideJoined = (data: { trip: SharedTrip }) => {
      console.log("Successfully joined shared ride:", data);
      setSharedTrip(data.trip);
      setShowRideSharingWindow(true);
    };

    const handleSharedRideUpdated = (data: { trip: SharedTrip; yourFare: number }) => {
      console.log("Shared ride updated:", data);
      setSharedTrip(data.trip);
      setYourFare(data.yourFare);
    };

    // ✅ UPDATED: This function now correctly calls the driver
    const handleSharedRideWindowClosed = (data: { trip: SharedTrip }) => {
      console.log("Matching window closed:", data);
      setSharedTrip(data.trip);
      
      // Check if the current user is the one who initiated the trip
      const isInitiator = data.trip?.passengers?.[0]?.userId === user._id;
      
      if (isInitiator) {
        const primaryRideId = data.trip?.passengers?.[0]?.rideId;
        if (primaryRideId) {
          console.log("Timer expired. Initiating call to find a driver...");
          // Pass trip details directly to the callDriver function
          callDriver(primaryRideId, data.trip.pickup, data.trip.destination);
        }
      }
      
      // Transition UI for all users in the trip
      setShowRideSharingWindow(false);
      setVehicleFound(true);
    };

    const handleRideCreationError = (data: { message: string }) => {
      alert(`Error: ${data.message}`);
      setShowRideSharingWindow(false);
      setConfirmRidePanel(true);
    };

    socket.on("ride-accepted", handleRideAccepted);
    socket.on("ride-rejected", handleRideRejected);
    socket.on("shared-ride-created", handleSharedRideCreated);
    socket.on("shared-ride-joined", handleSharedRideJoined);
    socket.on("shared-ride-updated", handleSharedRideUpdated);
    socket.on("shared-ride-window-closed", handleSharedRideWindowClosed);
    socket.on("ride-creation-error", handleRideCreationError);

    return () => {
      socket.off("ride-accepted", handleRideAccepted);
      socket.off("ride-rejected", handleRideRejected);
      socket.off("shared-ride-created", handleSharedRideCreated);
      socket.off("shared-ride-joined", handleSharedRideJoined);
      socket.off("shared-ride-updated", handleSharedRideUpdated);
      socket.off("shared-ride-window-closed", handleSharedRideWindowClosed);
      socket.off("ride-creation-error", handleRideCreationError);
    };
  }, [socket, user]);

  // GSAP Animations
  useGSAP(() => { if (panelOpen) { gsap.to(panelRef.current, { height: "70%", padding: 24 }); gsap.to(panelCloseRef.current, { opacity: 1 }); } else { gsap.to(panelRef.current, { height: "0%", padding: 0 }); gsap.to(panelCloseRef.current, { opacity: 0 }); } }, [panelOpen]);
  useGSAP(() => { if (vehiclePanel) { gsap.to(vehiclePanelRef.current, { y: 0 }); } else { gsap.to(vehiclePanelRef.current, { y: "100%" }); } }, [vehiclePanel]);
  useGSAP(() => { if (confirmRidePanel) { gsap.to(confirmRidePanelRef.current, { y: 0 }); } else { gsap.to(confirmRidePanelRef.current, { y: "100%" }); } }, [confirmRidePanel]);
  useGSAP(() => { if (vehicleFound) { gsap.to(vehicleFoundRef.current, { y: 0 }); } else { gsap.to(vehicleFoundRef.current, { y: "100%" }); } }, [vehicleFound]);
  useGSAP(() => { if (rideConfirmed) { gsap.to(RideConfirmationRef.current, { y: 0 }); } else { gsap.to(RideConfirmationRef.current, { y: "100%" }); } }, [rideConfirmed]);

  // API and Form Handlers
  const handlePickupChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPickup(inputValue);
    
    if (inputValue.trim() === '') {
        setPickupSuggestions([]);
        return;
    }

    // Only make API call if input is at least 3 characters (matches backend validation)
    if (inputValue.trim().length < 3) {
        setPickupSuggestions([]);
        return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/maps/get-suggestions`, { params: { input: inputValue }, headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPickupSuggestions(response.data);
    } catch (err) { console.error("Failed to fetch pickup suggestions", err); }
  };

  const handleDestinationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDestination(inputValue);

    if (inputValue.trim() === '') {
        setDestinationSuggestions([]);
        return;
    }

    // Only make API call if input is at least 3 characters (matches backend validation)
    if (inputValue.trim().length < 3) {
        setDestinationSuggestions([]);
        return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/maps/get-suggestions`, { params: { input: inputValue }, headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setDestinationSuggestions(response.data);
    } catch (err) { console.error("Failed to fetch destination suggestions", err); }
  };

  const submitHandler = (e: React.FormEvent) => { e.preventDefault(); };

  const findTrip = async () => {
    if (!pickupLocation || !destinationLocation) { alert("Please select both pickup and destination."); return; }
    setShowRoute(true); setVehiclePanel(true); setPanelOpen(false);
    try {
      const fareRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rides/get-fare`, { params: { pickup, destination }, headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setFare(fareRes.data);
    } catch (error) { console.error("Error fetching trip data", error); alert("Failed to fetch trip details."); }
  };

  const createRide = async (currentPassengerCount: number) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/rides/create`,
      {
        pickup,
        destination,
        vehicleType,
        passengerCount: currentPassengerCount,
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setRide(res.data);
    return res.data;
  };

  // ✅ UPDATED: callDriver now accepts pickup and destination to avoid stale state
  const callDriver = async (rideId: string, tripPickup: string, tripDestination: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/twilio/call-driver`,
        {
          phone: "+918862837370",
          rideId: rideId,
          pickup: tripPickup,
          destination: tripDestination,
        }
      );
      if (response.data.success) {
        console.log("Call initiated:", response.data.callSid);
      } else {
        console.error("Call failed:", response.data.error || "Unknown error");
        alert("Failed to initiate call to find a driver.");
        setVehicleFound(false);
      }
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred while calling.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Error making call:", errorMessage);
      alert(errorMessage);
      setVehicleFound(false);
    }
  };

  return (
    <div className="min-h-[100svh] relative overflow-hidden">
      <Image className="w-32 absolute left-9 top-1 z-10" src="/logo_campus.png" alt="Campus Cab Logo" width={160} height={160} />
      <div className="absolute inset-0 z-0">
        <LiveTracking pickup={showRoute ? pickupLocation : undefined} destination={showRoute ? destinationLocation : undefined} />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-end pointer-events-none">
        <div className="min-h-[30%] p-6 bg-white relative shadow-lg rounded-t-2xl pointer-events-auto">
          <h5 ref={panelCloseRef} onClick={() => setPanelOpen(false)} className="absolute opacity-0 right-6 top-6 text-2xl cursor-pointer"><i className="ri-arrow-down-wide-line"></i></h5>
          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form className="relative py-3" onSubmit={submitHandler}>
            <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
            <input onClick={() => { setPanelOpen(true); setActiveField("pickup"); }} value={pickup} onChange={handlePickupChange} className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full" type="text" placeholder="Add a pick-up location" />
            <input onClick={() => { setPanelOpen(true); setActiveField("destination"); }} value={destination} onChange={handleDestinationChange} className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3" type="text" placeholder="Enter your destination" />
          </form>
          <button onClick={findTrip} className={`px-4 py-1 rounded-lg mt-3 w-full ${!pickupLocation || !destinationLocation ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white"}`} disabled={!pickupLocation || !destinationLocation}>Find Trip</button>
        </div>
        <div ref={panelRef} className="bg-white h-0 z-20 pointer-events-auto">
          <LocationSearchPanel suggestions={activeField === "pickup" ? pickupSuggestions : destinationSuggestions} setVehiclePanel={setVehiclePanel} setPickup={setPickup} setDestination={setDestination} setPickupLocation={setPickupLocation} setDestinationLocation={setDestinationLocation} activeField={activeField} />
        </div>
      </div>

      <div ref={vehiclePanelRef} className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12">
        <VehiclePanel selectVehicle={setVehicleType} fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} setPassengerCount={setPassengerCount} />
      </div>

      <div ref={confirmRidePanelRef} className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12">
        <ConfirmRide createRide={createRide} pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType as VehicleType} setConfirmRidePanel={setConfirmRidePanel} passengerCount={passengerCount} />
      </div>

      <div ref={vehicleFoundRef} className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12">
        <LookingForDriver createRide={() => createRide(1)} pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType as VehicleType} setVehicleFound={setVehicleFound} setConfirmRidePanel={setConfirmRidePanel} />
      </div>
      
      {showRideSharingWindow && (
        <RideSharingWindow
          trip={sharedTrip}
          yourFare={yourFare}
        />
      )}

      <div ref={RideConfirmationRef} className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12">
        <RideConfirmation ride={ride} fare={fare[vehicleType as VehicleType]} setRideConfirmed={setRideConfirmed} setPickup={setPickup} setDestination={setDestination} setPickupLocation={setPickupLocation} setDestinationLocation={setDestinationLocation} />
      </div>
    </div>
  );
};

export default Home;