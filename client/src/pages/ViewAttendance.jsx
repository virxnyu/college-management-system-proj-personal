import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewAttendance() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/teacher/class-attendance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching attendance", err);
      }
    };

    fetchRecords();
  }, [token]);

  // 🔍 Filter + Sort logic
  useEffect(() => {
    let filtered = records;

    if (filterName) {
      filtered = filtered.filter((rec) =>
        rec.student?.name?.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter(
        (rec) =>
          new Date(rec.date).toISOString().slice(0, 10) === filterDate
      );
    }

    // ✅ Sorting logic
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let valA, valB;

        if (sortField === "student.name") {
          valA = a.student?.name || "";
          valB = b.student?.name || "";
        } else if (sortField === "date") {
          valA = new Date(a.date);
          valB = new Date(b.date);
        } else {
          valA = a[sortField] || "";
          valB = b[sortField] || "";
        }

        if (sortField === "date") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }

        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    setFilteredRecords(filtered);
  }, [filterName, filterDate, records, sortField, sortOrder]);

  return (
    <div>
      <h2>📅 Attendance Records</h2>

      {/* 🔍 Filters */}
      <input
        type="text"
        placeholder="🔎 Filter by student name"
        value={filterName}
        onChange={(e) => setFilterName(e.target.value)}
      />
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />
      <button
        onClick={() => {
          setFilterName("");
          setFilterDate("");
        }}
      >
        ❌ Clear Filters
      </button>

      {/* 🔽 Sort Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => {
            setSortField("student.name");
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          }}
        >
          Sort by Name {sortField === "student.name" && (sortOrder === "asc" ? "🔼" : "🔽")}
        </button>

        <button
          onClick={() => {
            setSortField("date");
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          }}
        >
          Sort by Date {sortField === "date" && (sortOrder === "asc" ? "🔼" : "🔽")}
        </button>

        <button
          onClick={() => {
            setSortField("status");
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          }}
        >
          Sort by Status {sortField === "status" && (sortOrder === "asc" ? "🔼" : "🔽")}
        </button>
      </div>

      {/* 📋 Table */}
      <table border="1" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.length === 0 ? (
            <tr>
              <td colSpan="4">No records found</td>
            </tr>
          ) : (
            filteredRecords.map((rec) => (
              <tr key={rec._id}>
                <td>{rec.student?.name}</td>
                <td>{rec.student?.email}</td>
                <td>{new Date(rec.date).toLocaleDateString()}</td>
                <td>{rec.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ViewAttendance;
// This code defines a React component for viewing attendance records.
// It fetches attendance data from an API, 
// allows filtering by student name and date,
// and provides sorting options for the records.
// It displays the records in a table format with
// options to clear filters and sort by different fields.