import { GoogleMap, DirectionsService, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// Define the props this component will accept
interface TripMapProps {
  startLocation: string;
  endLocation: string;
}

// Define the map's container style
const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem",
};

// Set the map's center (e.g., a default location)
const center = {
  lat: 12.9716, // Default to Bengaluru
  lng: 77.5946,
};

export default function TripMap({ startLocation, endLocation }: TripMapProps) {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <p className="text-red-500">Google Maps API Key is missing.</p>;
  }

  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey });
  if (loadError) {
    return <p className="text-red-500">Failed to load Google Maps.</p>;
  }
  if (!isLoaded) {
    return <Loader2 className="animate-spin" />;
  }

  // This function is called when the DirectionsService gets a result
  const directionsCallback = (
    response: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === "OK" && response) {
      setDirectionsResponse(response);
      
      // Extract distance and duration from the first leg of the route
      const route = response.routes[0].legs[0];
      if (route.distance) setDistance(route.distance.text);
      
      // Check for duration_in_traffic, fallback to regular duration
      if (route.duration_in_traffic) {
        setDuration(route.duration_in_traffic.text + " (in current traffic)");
      } else if (route.duration) {
        setDuration(route.duration.text);
      }
    } else {
      console.error(`Directions request failed due to ${status}`);
    }
  };

  return (
    <div className="space-y-4">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={10}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* We only request directions *after* we have a start/end location */}
        {startLocation && endLocation && !directionsResponse && (
          <DirectionsService
            options={{
              origin: startLocation,
              destination: endLocation,
              travelMode: google.maps.TravelMode.DRIVING,
              provideRouteAlternatives: false,
              // THIS IS THE KEY: Ask for traffic-aware duration
              drivingOptions: {
                departureTime: new Date(), // Use current time
                trafficModel: google.maps.TrafficModel.BEST_GUESS,
              },
            }}
            callback={directionsCallback}
          />
        )}

        {/* This component renders the blue line (the route) on the map */}
        {directionsResponse && (
          <DirectionsRenderer
            options={{
              directions: directionsResponse,
            }}
          />
        )}
      </GoogleMap>

      {/* Display the Distance and Duration */}
      {distance && duration && (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Estimated Distance</p>
            <p className="text-2xl font-bold text-white">{distance}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Estimated Time</p>
            <p className="text-2xl font-bold text-white">{duration}</p>
          </div>
        </div>
      )}
    </div>
  );
}