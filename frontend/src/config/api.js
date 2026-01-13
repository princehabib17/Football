// Centralized API base URL selection.
//
// - In local dev, set REACT_APP_API_URL (e.g. http://localhost:5000).
// - In Docker/prod behind a reverse proxy, prefer same-origin requests and
//   proxy `/api` to the backend (so REACT_APP_API_URL can be omitted).
const raw = process.env.REACT_APP_API_URL || '';

// Normalize to avoid double slashes when concatenating.
export const API_BASE_URL = raw.replace(/\/+$/, '');

