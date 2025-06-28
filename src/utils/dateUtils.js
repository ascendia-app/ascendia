// src/utils/dateUtils.js

// Helper to format date strings for display
export const formatDateDisplay = (dateString) => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        // Check for invalid date
        if (isNaN(date.getTime())) {
            return "-";
        }
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString("en-US", options);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "-";
    }
};

// Helper to combine date and time strings into a Date object for comparison
export const createDateTimeObject = (dateString, timeString, session) => {
    let finalTime = timeString;
    if (!finalTime) {
        // Provide default times if only session is available or no time given
        switch (session) {
            case "AM": finalTime = "09:00"; break;
            case "PM": finalTime = "14:00"; break;
            case "EV": finalTime = "19:00"; break;
            default: finalTime = "00:00"; // Default to midnight if no time/session
        }
    }

    // Ensure dateString is in YYYY-MM-DD format for reliable parsing
    if (!dateString) return null; // Cannot create a date without a date string

    // Construct a full ISO-like string for reliable Date object creation
    // Example: "2025-07-28T14:00:00"
    const dateTimeISO = `${dateString}T${finalTime}:00`;
    const dateObject = new Date(dateTimeISO);

    // Validate the date object
    if (isNaN(dateObject.getTime())) {
        console.error("Invalid date or time string combination:", { dateString, timeString, session, dateTimeISO });
        return null;
    }
    return dateObject;
};

// You can add more utility functions here as needed
