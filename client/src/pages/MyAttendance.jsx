// client/src/pages/MyAttendance.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import './MyAttendance.css'; // Keep existing styles

// --- NEW: Import Chart components ---
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// --- NEW: Register ChartJS components ---
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
// --- END NEW ---


const MyAttendance = () => {
    const { subjectId } = useParams();
    const [records, setRecords] = useState([]); // Keep for table and chart data
    const [subject, setSubject] = useState(null);
    const [stats, setStats] = useState(null); // <-- NEW: State for calculated stats
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // <-- NEW: State for specific errors

    // --- NEW: State for "What If" calculator ---
    const [missNextInput, setMissNextInput] = useState('');
    const [calculatedFuturePercentage, setCalculatedFuturePercentage] = useState(null);
    const [calculating, setCalculating] = useState(false);
    // --- END NEW ---


    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(''); // Reset errors on fetch
            setStats(null); // Reset stats
            setCalculatedFuturePercentage(null); // Reset calculator
            setMissNextInput('');
            try {
                // Fetch records, stats, and subject details concurrently
                const [recordsRes, statsRes, subjectRes] = await Promise.all([
                    axios.get(`/attendance/student/subject/${subjectId}`),
                    axios.get(`/attendance/student/stats/${subjectId}`), // <-- Fetch new stats endpoint
                    axios.get(`/subjects/${subjectId}`)
                ]);

                // Ensure records are sorted by date for the chart
                const sortedRecords = recordsRes.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setRecords(sortedRecords);
                setStats(statsRes.data); // <-- Store fetched stats
                setSubject(subjectRes.data);

            } catch (error) {
                console.error("Failed to fetch attendance details", error);
                setError(error.response?.data?.message || "Failed to load attendance details."); // <-- Set specific error
                setRecords([]);
                setStats(null);
                setSubject(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [subjectId]);

    // --- NEW: Function for "What If" calculation ---
    const handleWhatIfCalculate = async () => {
        if (!missNextInput || isNaN(parseInt(missNextInput)) || parseInt(missNextInput) < 0) {
            setError("Please enter a valid non-negative number of classes to miss.");
            return;
        }
        setCalculating(true);
        setError('');
        try {
            // Fetch stats again with the missNext query parameter
            const res = await axios.get(`/attendance/student/stats/${subjectId}`, {
                params: { missNext: missNextInput }
            });
            setCalculatedFuturePercentage(res.data.futurePercentage);
        } catch (error) {
             console.error("Failed to calculate future percentage", error);
             setError(error.response?.data?.message || "Calculation failed.");
             setCalculatedFuturePercentage(null);
        } finally {
            setCalculating(false);
        }
    };
    // --- END NEW ---

    // --- NEW: Prepare data for the chart ---
    const chartData = {
        labels: records.map(record => new Date(record.date).toLocaleDateString('en-CA')), // Use YYYY-MM-DD for labels
        datasets: [
            {
                label: 'Attendance Status (1 = Present, 0 = Absent)',
                data: records.map(record => (record.status === 'Present' ? 1 : 0)),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1 // Make line slightly curved
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Attendance Trend',
                color: 'var(--text-primary)', // Use CSS variables
                font: { size: 16 }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.parsed.y === 1 ? 'Status: Present' : 'Status: Absent';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 1, // Only 0 or 1
                ticks: {
                    stepSize: 1,
                     color: 'var(--text-secondary)', // Use CSS variables
                    callback: function (value) {
                        return value === 1 ? 'Present' : 'Absent';
                    }
                },
                grid: {
                     color: 'var(--background-tertiary)' // Use CSS variables
                }
            },
             x: {
                 ticks: {
                     color: 'var(--text-secondary)' // Use CSS variables
                },
                 grid: {
                     color: 'var(--background-tertiary)' // Use CSS variables
                }
             }
        },
    };
    // --- END NEW CHART DATA ---


    if (loading) return <div className="loading-container"><p>Loading Details...</p></div>;
    if (error && !loading) return <div className="attendance-details-container"><p className="message error">{error}</p></div>; // Show specific error


    // Existing calculations (can now use 'stats' state)
    const attended = stats?.attended ?? 0;
    const total = stats?.total ?? 0;
    const percentage = stats?.currentPercentage ?? 0;
    const classesNeeded = stats?.classesNeeded ?? 0;

    // Calculate streak from sorted records (as before)
    let currentStreak = 0;
    for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].status === 'Present') {
            currentStreak++;
        } else {
            break;
        }
    }
    // Calculate safeToMiss based on stats
    let safeToMiss = 0;
    if (total > 0 && percentage >= 75) {
        safeToMiss = Math.floor((attended / 0.75) - total);
    }

    return (
        <div className="attendance-details-container">
            <Link to="/dashboard" className="back-link">
                {/* ... Back arrow svg */} Back to Dashboard
            </Link>
            <header className="details-header">
                <h2>Attendance Details</h2>
                {subject && <h1>{subject.name}</h1>}
            </header>

            {/* Use stats from state */}
            <div className="stats-container">
                <div className="stat-card">
                    <h4>{percentage}%</h4>
                    <p>Overall Attendance</p>
                </div>
                <div className="stat-card">
                    <h4>{attended} / {total}</h4>
                    <p>Classes Attended</p>
                </div>
                <div className="stat-card">
                    <h4>{currentStreak}</h4>
                    <p>Current Streak</p>
                </div>
            </div>

            {/* --- NEW: Display Classes Needed --- */}
            {percentage < 75 && total > 0 && (
                <p className="needed-message stat-card"> {/* Reuse stat-card style */}
                    Attend the next <strong>{classesNeeded}</strong> class{classesNeeded !== 1 ? 'es' : ''} to reach 75%.
                </p>
            )}
            {/* --- END NEW --- */}


            {safeToMiss > 0 && (
                <p className="safe-to-miss-message">
                    You can miss the next {safeToMiss} class{safeToMiss > 1 ? 'es' : ''} and still maintain 75% attendance.
                </p>
            )}

            {/* --- NEW: "What If" Calculator --- */}
            <div className="what-if-calculator card"> {/* Add card style */}
                 <h4>"What If" Calculator</h4>
                 <div className="calculator-input">
                     <label htmlFor="missNext">If I miss the next:</label>
                     <input
                        type="number"
                        id="missNext"
                        value={missNextInput}
                        onChange={(e) => setMissNextInput(e.target.value)}
                        min="0"
                        placeholder="e.g., 2"
                     />
                     <span> classes, my attendance will be:</span>
                     <button onClick={handleWhatIfCalculate} disabled={calculating}>
                         {calculating ? 'Calculating...' : 'Calculate'}
                     </button>
                 </div>
                 {calculatedFuturePercentage !== null && (
                     <p className="calculator-result">
                          Approximately <strong>{calculatedFuturePercentage}%</strong>
                     </p>
                 )}
                 {error && <p className="message error">{error}</p>} {/* Show calculation errors here too */}
             </div>
            {/* --- END NEW --- */}


             {/* --- NEW: Attendance Chart --- */}
             {records.length > 0 && (
                 <div className="chart-container card"> {/* Add card style */}
                     <Line options={chartOptions} data={chartData} />
                 </div>
             )}
             {/* --- END NEW --- */}


            {/* Attendance Table (keep as before) */}
            <div className="table-wrapper">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Map sorted records from state */}
                        {records.length > 0 ? [...records].reverse().map(record => ( // Reverse for display (newest first)
                            <tr key={record._id}>
                                <td data-label="Date">{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                <td data-label="Status">
                                    <span className={`status-${record.status.toLowerCase()}`}>
                                        <span className="status-indicator"></span>
                                        {record.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="2" className="no-records-cell">No attendance has been marked for this subject yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyAttendance;