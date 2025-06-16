import React, { useEffect, useState } from "react";
import axios from "../axios";

export default function MyAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/attendance/student")
      .then((res) => {
        setRecords(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching attendance", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>📅 My Attendance Records</h2>
      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec._id}>
                <td>{new Date(rec.date).toLocaleDateString()}</td>
                <td>{rec.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
// This component fetches and displays
// the attendance records for the logged-in student.
// It uses the `/api/attendance/student` 
// endpoint to get the records and displays 
// them in a table format.