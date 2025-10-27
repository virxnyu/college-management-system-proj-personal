import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../axios'; // Use configured axios instance
import './SubjectSearch.css'; // We'll create this CSS file next

// Debounce function to limit API calls while typing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const SubjectSearch = ({ onSubjectSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Debounced search function
    const performSearch = useCallback(
        debounce(async (query) => {
            if (!query || query.trim().length < 2) { // Only search if query is at least 2 chars
                setResults([]);
                setIsLoading(false);
                setError('');
                return;
            }
            setIsLoading(true);
            setError('');
            console.log(`Searching for: "${query}"`);
            try {
                const response = await axios.get(`/subjects/search?q=${encodeURIComponent(query)}`);
                console.log("Search results:", response.data);
                setResults(response.data);
            } catch (err) {
                console.error("Error searching subjects:", err);
                setError('Failed to fetch search results.');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500), // Wait 500ms after user stops typing
        [] // Empty dependency array for useCallback
    );

    useEffect(() => {
        performSearch(searchTerm);
    }, [searchTerm, performSearch]);

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Handle clicking on a result (could be used to auto-fill enroll dropdown)
    const handleResultClick = (subject) => {
        console.log("Selected subject:", subject);
        // Optional: Call a prop function to handle selection
        if (onSubjectSelect) {
            onSubjectSelect(subject);
        }
        // Maybe clear search after selection?
        // setSearchTerm('');
        // setResults([]);
    };

    return (
        <div className="subject-search-container">
            <h4><i className="fas fa-search"></i> Find Subjects</h4>
            <input
                type="text"
                placeholder="Search by name or code (e.g., Physics, PHY101)"
                value={searchTerm}
                onChange={handleInputChange}
                className="search-input"
            />
            {isLoading && <p className="loading-message">Searching...</p>}
            {error && <p className="error-message">{error}</p>}
            {results.length > 0 && (
                <ul className="search-results-list">
                    {results.map((subject) => (
                        <li key={subject._id} onClick={() => handleResultClick(subject)} className="search-result-item">
                            <span className="result-name">{subject.name} ({subject.code})</span>
                            <span className="result-teacher">Teacher: {subject.teacher?.name || 'N/A'}</span>
                        </li>
                    ))}
                </ul>
            )}
            {!isLoading && searchTerm.length >= 2 && results.length === 0 && !error && (
                <p className="no-results-message">No subjects found matching "{searchTerm}".</p>
            )}
        </div>
    );
};

// Add Font Awesome library link to your public/index.html if you haven't already
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" xintegrity="sha512-..." crossorigin="anonymous" referrerpolicy="no-referrer" />


export default SubjectSearch;
