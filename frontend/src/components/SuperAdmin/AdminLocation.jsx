import React, { useState, useEffect } from "react";
import GoogleMapsuper from "./GoogleMapsuper";
import { BASE_URL } from "../../constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./TETable.css"; // Assuming you have a CSS file for custom styles

const AdminLocation = () => {
  const [TE, setTE] = useState([]);
  const [filteredTE, setFilteredTE] = useState([]);
  const [selectedTE, setSelectedTE] = useState(null);
  const [location, setLocation] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [locationNotFound, setLocationNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAllTE = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/getAllAdmin`);
        if (response.ok) {
          const data = await response.json();
          setTE(data);
          setFilteredTE(data);
        } else {
          console.error("Failed to fetch All TE");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchAllTE();
  }, []);

  useEffect(() => {
    const filtered = TE.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTE(filtered);
  }, [searchQuery, TE]);

  const openModal = async (id) => {
    await fetchLocations(id, selectedDate);
  };

  const fetchLocations = async (id, date) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/location/get-location/${id || selectedTE}/${date}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.dateLocation.locations.length > 0) {
          setLocation(data.dateLocation.locations);
          setShowMap(true);
          setLocationNotFound(false);
        } else {
          setLocation([]);
          setShowMap(false);
          setLocationNotFound(true);
        }
      } else {
        console.error("Failed to fetch location");
        setLocation([]);
        setLocationNotFound(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setLocation([]);
      setLocationNotFound(true);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTE.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTE.length / itemsPerPage);

  return (
    <div className="flex flex-wrap w-full">
      <div className="p-4 rounded-lg shadow-lg overflow-auto border border-purple-900 w-full">
        <div className="lg:text-xl md:text-xl text-sm font-bold mb-4 text-[#5443c3]">
          Admin Details
        </div>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
        />
        <table className="min-w-full bg-white border lg:text-xl md:text-xl text-sm text-center">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white">
                Name
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white">
                Emp Mail ID
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white">
                Location
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white">
                Select Date
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b text-[#5443c3]">
                    {item.name}
                  </td>
                  <td className="py-2 px-4 border-b text-[#5443c3]">
                    {item.email}
                  </td>
                  <td
                    className="py-2 px-4 border-b text-blue-500 underline cursor-pointer"
                    onClick={() => openModal(item._id)}
                  >
                    Click here
                  </td>
                  <td className="py-2 px-4 border-b">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="yyyy-MM-dd"
                      className="border rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No managers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 mx-1 border rounded ${
                  currentPage === page ? "bg-[#5443c3] text-white" : "bg-white"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
      </div>
      {showMap && (
        <div className="w-full p-4 absolute top-0 left-0 z-50">
          {location.length > 0 ? (
            <GoogleMapsuper
              locations={location}
              onClose={() => setShowMap(false)}
              className="w-full"
            />
          ) : (
            <div className="text-red-600 font-semibold">
              No locations found for the selected date.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminLocation;
