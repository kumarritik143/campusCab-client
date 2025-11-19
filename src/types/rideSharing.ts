export type SharedTripPassenger = {
  userId: string;
  rideId: string;
  passengerCount: number;
  socketId?: string;
  name?: string;
  phone?: string;
};

export type SharedTripStatus = "OPEN" | "ASSIGNED" | "FULL" | "CLOSED";

export type SharedTrip = {
  primaryRideId?: string;
  driverId?: string | null;
  passengers: SharedTripPassenger[];
  capacity: number;
  seatsFilled: number;
  pickup: string;
  destination: string;
  vehicleType?: "auto";
  baseFare?: number;
  status: SharedTripStatus;
  createdAt: string;
};

export type RideNotificationPayload = {
  rideId: string;
  pickup: string;
  destination: string;
};

