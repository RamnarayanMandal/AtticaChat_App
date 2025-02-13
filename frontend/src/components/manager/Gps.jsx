import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../constants";

const GPSTracker = ({ managerId, path }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [prevLocation, setPrevLocation] = useState(null);

  useEffect(() => {
    const geo = navigator.geolocation;

    const handlePositionUpdate = async (position) => {
      const { latitude, longitude } = position.coords;

      // Check if movement occurred by comparing with the previous location
      if (
        !prevLocation ||
        prevLocation.latitude !== latitude ||
        prevLocation.longitude !== longitude
      ) {
        setCurrentLocation({ latitude, longitude });
        setPrevLocation({ latitude, longitude }); // Update previous location
        await fetchAndSaveAddress(latitude, longitude);
      }
    };

    const fetchAndSaveAddress = async (latitude, longitude) => {
      try {
        const url = `https://api.opencagedata.com/geocode/v1/json?key=b5ddfdc0bf0c428e8530c8aeae8ec37e&q=${latitude}+${longitude}&pretty=1&no_annotations=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const address = data.results[0].formatted;
          const { lat, lng } = data.results[0].geometry;

          console.log("Location fetched:", { lat, lng, address });

          await axios.post(`${BASE_URL}/api/location/${path}`, {
            userId: managerId,
            latitude: lat,
            longitude: lng,
            address,
          });

          console.log("Location saved successfully");
        } else {
          console.error("Address not available");
        }
      } catch (error) {
        console.error("Error fetching or saving address:", error);
      }
    };

    // Start watching position
    const watchId = geo.watchPosition(handlePositionUpdate, (error) => {
      console.error("Error watching position:", error);
    });

    return () => {
      geo.clearWatch(watchId);
    };
  }, [prevLocation, managerId, path]);

  return null;
};

export default GPSTracker;
