/**
 * @fileoverview Date utility functions for the application.
 * This file provides helper functions for calculating time differences (e.g., for countdowns)
 * and formatting dates into readable strings.
 */

/**
 * Calculates the time remaining until a target date.
 *
 * @param {string|Date} targetDate - The target date string or Date object.
 * @returns {{
 * total: number,
 * days: number,
 * hours: number,
 * minutes: number,
 * seconds: number,
 * isTimeUp: boolean
 * }} An object containing the remaining time components and a flag if time is up.
 */
export const getTimeRemaining = (targetDate) => {
  // Ensure the targetDate is a Date object. If it's a string, parse it.
  const target = new Date(targetDate);
  const now = new Date(); // Current time

  // Calculate the total milliseconds remaining
  const total = target.getTime() - now.getTime();

  // Initialize all time components to 0
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  let days = 0;
  let isTimeUp = total <= 0; // Check if the target date has passed

  if (!isTimeUp) {
    // Calculate components if time is still remaining
    seconds = Math.floor((total / 1000) % 60);
    minutes = Math.floor((total / 1000 / 60) % 60);
    hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    days = Math.floor(total / (1000 * 60 * 60 * 24));
  }

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    isTimeUp,
  };
};

/**
 * Formats a date string into a human-readable format.
 * Example: "YYYY-MM-DD" or Date object -> "Month Day, Year"
 *
 * @param {string|Date} dateInput - The date string or Date object to format.
 * @returns {string} The formatted date string. Returns an empty string if invalid input.
 */
export const formatDate = (dateInput) => {
  if (!dateInput) {
    return '';
  }

  const date = new Date(dateInput);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date input for formatDate:", dateInput);
    return '';
  }

  // Options for formatting the date
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  // Use toLocaleDateString for a user-friendly, locale-aware date format
  return date.toLocaleDateString(undefined, options);
};

/**
 * Formats a date and time string into a human-readable format including time.
 * Example: "YYYY-MM-DDTHH:mm:ss" -> "Month Day, Year at HH:MM AM/PM"
 *
 * @param {string|Date} dateTimeInput - The date and time string or Date object to format.
 * @returns {string} The formatted date and time string. Returns an empty string if invalid input.
 */
export const formatDateTime = (dateTimeInput) => {
  if (!dateTimeInput) {
    return '';
  }

  const date = new Date(dateTimeInput);

  if (isNaN(date.getTime())) {
    console.error("Invalid date/time input for formatDateTime:", dateTimeInput);
    return '';
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour format with AM/PM
  };

  return date.toLocaleDateString(undefined, options);
};
