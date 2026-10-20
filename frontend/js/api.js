// Reusable API helpers for the Hospital Management System
const API_BASE_URL = "http://127.0.0.1:8000/api";
const TOKEN_KEY = "hms_token";

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function redirectToLogin() {
  clearToken();
  if (!location.pathname.endsWith("login.html")) location.href = "login.html";
}

async function apiRequest(endpoint, { method = "GET", body = null, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (!token) { redirectToLogin(); throw new Error("Please log in"); }
    headers["Authorization"] = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : null });
  } catch (e) {
    throw new Error("Cannot reach the server. Make sure the FastAPI backend is running on port 8000.");
  }
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const detail = data && data.detail ? (typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)) : null;
    switch (res.status) {
      case 401:
        if (auth) { redirectToLogin(); throw new Error("Session expired. Please log in again."); }
        throw new Error(detail || "Unauthorized");
      case 403: throw new Error(detail || "You do not have permission to do that.");
      case 404: throw new Error(detail || "Resource not found.");
      case 422: throw new Error(detail || "Invalid data submitted.");
      case 500: throw new Error(detail || "Server error. Please try again later.");
      default: throw new Error(detail || `Request failed (${res.status})`);
    }
  }
  return data;
}

// Auth
const registerUser = (d) => apiRequest("/register", { method: "POST", body: d, auth: false });
const loginUser = (d) => apiRequest("/login", { method: "POST", body: d, auth: false });
const getProfile = () => apiRequest("/profile");

// Patients
const getPatients = () => apiRequest("/patients");
const getPatient = (id) => apiRequest(`/patients/${id}`);
const createPatient = (d) => apiRequest("/patients", { method: "POST", body: d });
const updatePatient = (id, d) => apiRequest(`/patients/${id}`, { method: "PUT", body: d });
const deletePatient = (id) => apiRequest(`/patients/${id}`, { method: "DELETE" });

// Doctors
const getDoctors = () => apiRequest("/doctors");
const getDoctor = (id) => apiRequest(`/doctors/${id}`);
const createDoctor = (d) => apiRequest("/doctors", { method: "POST", body: d });
const updateDoctor = (id, d) => apiRequest(`/doctors/${id}`, { method: "PUT", body: d });
const deleteDoctor = (id) => apiRequest(`/doctors/${id}`, { method: "DELETE" });

// Appointments
const getAppointments = () => apiRequest("/appointments");
const getAppointment = (id) => apiRequest(`/appointments/${id}`);
const createAppointment = (d) => apiRequest("/appointments", { method: "POST", body: d });
const updateAppointment = (id, d) => apiRequest(`/appointments/${id}`, { method: "PUT", body: d });
const deleteAppointment = (id) => apiRequest(`/appointments/${id}`, { method: "DELETE" });

// ---------- Shared UI helpers ----------
function showToast(message, type = "info") {
  let c = document.getElementById("toast-container");
  if (!c) { c = document.createElement("div"); c.id = "toast-container"; document.body.appendChild(c); }
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = message;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function setLoading(btn, loading, text) {
  if (!btn) return;
  if (loading) { btn.dataset.text = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> ' + (text || "Please wait..."); }
  else { btn.disabled = false; btn.innerHTML = btn.dataset.text || btn.innerHTML; }
}

// Protects a page, renders the user name in the top bar, wires logout + mobile menu
async function initProtectedPage() {
  if (!getToken()) { redirectToLogin(); return null; }
  document.querySelectorAll("[data-logout]").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); clearToken(); location.href = "login.html"; }));
  const toggle = document.querySelector(".menu-toggle");
  if (toggle) toggle.addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
  try {
    const user = await getProfile();
    document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = user.name));
    document.querySelectorAll("[data-user-initial]").forEach((el) => (el.textContent = user.name.charAt(0).toUpperCase()));
    return user;
  } catch (e) { showToast(e.message, "error"); return null; }
}
