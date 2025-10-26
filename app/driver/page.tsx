"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MapPin, Siren, Send, Loader2, Clock } from "lucide-react";
import TripMap from "@/components/TripMap"; // Import our Google Maps component

// --- Types ---
type UiState = "idle" | "filling" | "submitting" | "pending" | "error";
type CriticalLevel = "low" | "medium" | "high";
interface SubmittedTrip {
  start: string;
  end: string;
}

// --- Main Component ---
export default function DriverDashboard() {
  const { user } = useUser();
  const [uiState, setUiState] = useState<UiState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [criticalLevel, setCriticalLevel] = useState<CriticalLevel>("medium");

  // State to store the trip details for the map
  const [submittedTrip, setSubmittedTrip] = useState<SubmittedTrip | null>(
    null
  );

  const vehicleNumber = (user?.publicMetadata?.vehicleNumber as string) || "N/A";
  const driverName = user?.fullName || "Driver";

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiState("submitting");
    setError(null);

    try {
      // 1. Submit the trip request to our own backend
      const response = await fetch("/api/trips/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startLocation, endLocation, criticalLevel }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit request");
      }

      // 2. On success, save the locations for the map
      setSubmittedTrip({
        start: startLocation,
        end: endLocation,
      });
      
      // 3. Move to pending state
      setUiState("pending");

    } catch (err: any) {
      setError(err.message);
      setUiState("filling"); // Go back to the form on error
    }
  };

  // --- RENDER LOGIC ---

  // 1. Idle State
  if (uiState === "idle") {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          Welcome, {driverName}
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Vehicle: {vehicleNumber}
        </p>
        <button
          onClick={() => setUiState("filling")}
          className="bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-2xl 
                     hover:bg-red-700 transition-colors flex items-center justify-center 
                     mx-auto shadow-lg"
        >
          <Siren className="mr-3 h-8 w-8" />
          Start a New Trip
        </button>
      </div>
    );
  }

  // 2. Pending State (with Google Map)
  if (uiState === "pending" && submittedTrip) {
    return (
      <div className="container mx-auto max-w-3xl p-8 text-center flex flex-col items-center">
        <Clock className="h-24 w-24 text-yellow-400 animate-pulse" />
        <h1 className="text-4xl font-bold text-white mt-6">
          Request Sent
        </h1>
        <p className="text-xl text-gray-300 mt-2 mb-8">
          Getting assistance from the nearby RTO...
        </p>

        {/* Render the Google Map component here */}
        <div className="w-full">
          <TripMap
            startLocation={submittedTrip.start}
            endLocation={submittedTrip.end}
          />
        </div>
      </div>
    );
  }

  // 3. Form State (filling, submitting, error)
  return (
    <div className="container mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold text-white text-center">
        New Trip Request
      </h1>
      <p className="text-center text-gray-400 mb-6">Vehicle: {vehicleNumber}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Start Location */}
        <div>
          <label
            htmlFor="start"
            className="block text-sm font-medium text-gray-300"
          >
            Start Location
          </label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="start"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 
                         text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g., City Hospital, Koramangala"
            />
          </div>
        </div>

        {/* End Location */}
        <div>
          <label
            htmlFor="end"
            className="block text-sm font-medium text-gray-300"
          >
            End Location
          </label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="end"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 
                         text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g., Manipal Hospital, Whitefield"
            />
          </div>
        </div>

        {/* Critical Level */}
        <div>
          <label
            htmlFor="criticalLevel"
            className="block text-sm font-medium text-gray-300"
          >
            Critical Level
          </label>
          <select
            id="criticalLevel"
            value={criticalLevel}
            onChange={(e) =>
              setCriticalLevel(e.target.value as CriticalLevel)
            }
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 mt-1 
                       text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uiState === "submitting"}
          className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg 
                     hover:bg-red-700 transition-colors flex items-center justify-center 
                     disabled:bg-red-900 disabled:cursor-not-allowed"
        >
          {uiState === "submitting" ? (
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          ) : (
            <Send className="mr-3 h-5 w-5" />
          )}
          {uiState === "submitting" ? "Submitting..." : "Submit Request"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-400 text-center">{error}</p>}
      </form>
    </div>
  );
}