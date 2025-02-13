import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { IoIosCloseCircleOutline } from "react-icons/io";

// Custom SVG icons
const greenIcon = new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" fill="green" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const redIcon = new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" fill="red" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const CloseButton = ({ onClose }) => {
  const map = useMap();

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control">
        <IoIosCloseCircleOutline
          className="text-4xl text-red-500 bg-white cursor-pointer m-2"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

// Function to convert timestamp to local time
const convertToLocalTime = (timestamp) => {
  if (!timestamp) return "Time: N/A";
  
  const date = new Date(timestamp); // Convert timestamp to Date object
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;

  return `Time: ${formattedTime}`;
};

const GoogleMapsuper = ({ locations, onClose }) => {
  if (!locations || locations.length === 0) return null;

  console.log("GoogleMapsuper", locations);

  const position = [locations[0].latitude, locations[0].longitude]; // Use the first location as the center point

  return (
    <div className="relative h-screen w-full border-2 border-[#5443c3]">
      <MapContainer center={position} zoom={13} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render all locations */}
        {locations.map((location, index) => {
          const isCurrent = index === 0; // Current location is the first in the list
          const isLast = index === locations.length - 1; // Last location in the list

          return isCurrent ? (
            <Marker
              key={index}
              position={[location.latitude, location.longitude]}
              icon={redIcon}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              Last Location
              <br />
                {convertToLocalTime(location.timestamp)}
              </Tooltip>
            </Marker>
          ) : isLast ? (
            <Marker
              key={index}
              position={[location.latitude, location.longitude]}
              icon={greenIcon}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                Present Location
                 <br />
                {convertToLocalTime(location.timestamp)}
              </Tooltip>
            </Marker>
          ) : (
            <CircleMarker
              key={index}
              center={[location.latitude, location.longitude]}
              radius={5}
              color="red"
              fillOpacity={0.8}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                Intermediate Location<br />
                {convertToLocalTime(location.timestamp)} {/* Display local time */}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Close button */}
        <CloseButton onClose={onClose} />
      </MapContainer>
    </div>
  );
};

export default GoogleMapsuper;
