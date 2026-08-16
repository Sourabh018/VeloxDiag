import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 30s — Render free tier cold start can take 20-30s
  headers: {
    "Content-Type": "application/json",
  },
});

// Attaches the per-user session token (see AuthFilter on the backend) to
// every request as a Bearer token, read fresh from localStorage each time
// so logging in takes effect immediately without a page reload. Also still
// sends the old X-Dashboard-Token shared-secret header if present, for
// deployments that use DashboardAccessFilter instead of/alongside real
// per-user auth — the two mechanisms are independent (see AuthController
// javadoc), so sending both is harmless.
apiClient.interceptors.request.use((config) => {
  const sessionToken = localStorage.getItem("veloxdiag_session_token");
  if (sessionToken) {
    config.headers["Authorization"] = `Bearer ${sessionToken}`;
  }
  const dashboardToken = localStorage.getItem("veloxdiag_dashboard_token");
  if (dashboardToken) {
    config.headers["X-Dashboard-Token"] = dashboardToken;
  }
  return config;
});

// If the backend rejects the stored session token (expired/invalid), clear it
// and reload so LoginGate falls back to the login screen instead of leaving
// the user stuck on "Login required" errors while looking logged in.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("veloxdiag_session_token");
      localStorage.removeItem("veloxdiag_session_email");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default apiClient;