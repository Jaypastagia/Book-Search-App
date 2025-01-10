import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { FiSearch } from "react-icons/fi";

const App = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [serverResponseTime, setServerResponseTime] = useState("");
  const [resultsPerPage, setResultsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/search`, {
        params: { query },
      });
      setBooks(response.data.books);
      setStatistics(response.data.statistics);
      setServerResponseTime(response.data.serverResponseTime);
      setCurrentPage(0);
      setExpandedDescriptions({});
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(); // Default query can be set here, e.g., "React"
  }, []);

  const handlePageChange = (selected) => {
    setCurrentPage(selected.selected);
  };

  const handleToggleDescription = (index) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const paginatedBooks = books.slice(
    currentPage * resultsPerPage,
    (currentPage + 1) * resultsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-cyan-600 text-white p-4">
        <h1 className="text-3xl font-bold text-center">Book Search App</h1>
      </header>

      <main className="p-6">
        {/* Search Form */}
        <div className="max-w-lg mx-auto flex items-center border rounded-lg p-2 bg-white shadow-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchBooks(); // Call the API when Enter is pressed
              }
            }}
            placeholder="Search for books..."
            className="flex-grow px-4 py-2 outline-none"
          />
          <button
            onClick={fetchBooks}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition"
          >
            <FiSearch />
            Search
          </button>
        </div>

        {/* Results per page */}
        <div className="mt-4 flex justify-between items-center">
          <label className="text-lg">
            Results per page:
            <select
              value={resultsPerPage}
              onChange={(e) => setResultsPerPage(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded-md"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <div className="loader border-t-4 border-b-4 border-cyan-600 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Book List */}
            <ul className="mt-6 space-y-4">
              {paginatedBooks.map((book, index) => {
                const { author, title, description } = book || {};
                const authorList = author ? author : "Unknown Author";
                const isExpanded = expandedDescriptions[index];
                const truncatedDescription = description
                  ? description.slice(0, 100) + "..."
                  : "No description available.";

                return (
                  <li
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    <div className="font-semibold">
                      {authorList} - {title}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {isExpanded
                        ? description || "No description available."
                        : truncatedDescription}
                    </p>
                    {description && (
                      <button
                        onClick={() => handleToggleDescription(index)}
                        className="mt-2 text-cyan-600 hover:underline text-sm"
                      >
                        {isExpanded ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            <div className="mt-6">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={Math.ceil(books.length / resultsPerPage)}
                onPageChange={handlePageChange}
                containerClassName="flex justify-center gap-2"
                pageClassName="px-4 py-2 border rounded-lg"
                activeClassName="bg-cyan-600 text-white"
              />
            </div>
          </>
        )}

        {/* Statistics */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">Statistics</h2>
          <p className="mt-2">Total Results: {statistics.totalResults}</p>
          <p>Most Common Author: {statistics.mostCommonAuthor || "N/A"}</p>
          <p>Earliest Publication Date: {statistics.earliestDate || "N/A"}</p>
          <p>Latest Publication Date: {statistics.latestDate || "N/A"}</p>
          <p>Server Response Time: {serverResponseTime}</p>
        </div>
      </main>
    </div>
  );
};

export default App;