import React, { useState, useEffect } from "react";
import GoogleMapsuper from "./GoogleMapsuper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../../constants";
import { FaSearch } from "react-icons/fa"; // Import search icon

const BillingTeamLocaton = () => {
  const [manager, setManager] = useState([]);
  const [filteredManager, setFilteredManager] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedManager, setSelectedManager] = useState(null);
  const [location, setLocation] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [locationNotFound, setLocationNotFound] = useState(false);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchAllManagers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/billingTeam/getAllUsers`);
        if (response.ok) {
          const data = await response.json();
          setManager(data);
          setFilteredManager(data); // Initialize filtered list
        } else {
          console.error("Failed to fetch All Managers");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchAllManagers();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = manager.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredManager(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  const fetchLocations = async (id, date) => {
    try {
      const formattedDate = formatDate(date);
      const response = await fetch(
        `${BASE_URL}/api/location/get-location/${id}/${formattedDate}`
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

  const openModal = async (id) => {
    await fetchLocations(id, selectedDate);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredManager.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredManager.length / itemsPerPage);

  return (
    <div className="flex flex-wrap w-full">
      <div className="p-4 rounded-lg shadow-lg overflow-auto border border-purple-900 w-full text-left">
        <div className="flex justify-between items-center mb-4">
          <h1 className="lg:text-xl md:text-xl text-sm font-bold text-[#5443c3]">
          Billing Team Details
          </h1>
          <div className="flex items-center border rounded px-2 py-1 w-1/3 border-black">
            <FaSearch className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-none outline-none w-full"
            />
          </div>
        </div>
        <table className="min-w-full bg-white border lg:text-xl md:text-xl text-sm text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
                Name
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
              phone
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
              email
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
              group
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
              branch_name
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
              branch_state
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
              branch_city
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
              address
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
              branch_pincode
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
                Location
              </th>
              <th className="py-2 px-4 border-b bg-[#5443c3] text-white text-left">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {item.name}
                </td>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {item.phone}
                </td>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {item.email}
                </td>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {Array.isArray(item.group) && item.group.length > 0
                    ? item.group.map((groupItem, index) => (
                        <div key={index}>
                          <span>{groupItem.name}</span>
                        </div>
                      ))
                    : "No Group Info"}
                </td>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {item.branch_name}
                </td>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {item.branch_state}
                </td>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {item.branch_city}
                </td>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {item.address}
                </td>
                <td className="py-2 px-4 border-b text-[#5443c3] text-left">
                  {item.branch_pincode}
                </td>

                <td
                  className="py-2 px-4 border-b text-decoration-line: underline text-left"
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => openModal(item._id)}
                >
                  Click here
                </td>
                <td className="py-2 px-4 border-b text-left">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="border rounded px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-[#5443c3] text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-[#5443c3] text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {locationNotFound && (
        <div className="text-red-500 p-4 text-left">
          No locations found for the selected date.
        </div>
      )}
      {showMap && location.length > 0 && (
        <div className="w-full p-4 text-left absolute top-0 left-0 z-50">
          <GoogleMapsuper
            locations={location}
            onClose={() => setShowMap(false)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default BillingTeamLocaton;
