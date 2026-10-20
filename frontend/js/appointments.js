let appointments = [];
const modal = () => document.getElementById("modal");
const form = () => document.getElementById("entity-form");

function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function loadDropdowns() {
  try {
    const [patients, doctors] = await Promise.all([getPatients(), getDoctors()]);
    form().patient_id.innerHTML = '<option value="">Select patient</option>' + patients.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
    form().doctor_id.innerHTML = '<option value="">Select doctor</option>' + doctors.map((d) => `<option value="${d.id}">${escapeHtml(d.name)} (${escapeHtml(d.specialization)})</option>`).join("");
  } catch (e) { showToast(e.message, "error"); }
}

async function loadAppointments() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = '<tr class="loading-row"><td colspan="7"><span class="spinner"></span> Loading...</td></tr>';
  try { appointments = await getAppointments(); render(); }
  catch (e) { tbody.innerHTML = `<tr><td colspan="7" class="empty">${escapeHtml(e.message)}</td></tr>`; showToast(e.message, "error"); }
}

function render() {
  const status = document.getElementById("status-filter").value;
  const rows = appointments.filter((a) => !status || a.status === status);
  document.getElementById("table-body").innerHTML = rows.length ? rows.map((a) => `
    <tr><td>${a.id}</td><td>${escapeHtml(a.patient_name)}</td><td>${escapeHtml(a.doctor_name)}</td>
    <td>${formatDate(a.appointment_date)}</td><td>${escapeHtml(a.reason || "-")}</td>
    <td><span class="badge badge-${a.status}">${a.status}</span></td>
    <td class="actions"><button class="btn btn-outline btn-sm" onclick="openEdit(${a.id})">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="removeAppointment(${a.id})">Delete</button></td></tr>`).join("")
    : '<tr><td colspan="7" class="empty">No appointments found</td></tr>';
}

async function openAdd() {
  await loadDropdowns();
  form().reset(); form().dataset.id = "";
  form().status.value = "Scheduled";
  document.getElementById("modal-title").textContent = "Book Appointment";
  modal().classList.add("open");
}

async function openEdit(id) {
  const a = appointments.find((x) => x.id === id); if (!a) return;
  await loadDropdowns();
  const f = form(); f.dataset.id = id;
  f.patient_id.value = a.patient_id; f.doctor_id.value = a.doctor_id;
  f.appointment_date.value = toLocalInput(a.appointment_date);
  f.reason.value = a.reason || ""; f.status.value = a.status;
  document.getElementById("modal-title").textContent = "Edit Appointment";
  modal().classList.add("open");
}

async function removeAppointment(id) {
  if (!confirm("Delete this appointment?")) return;
  try { await deleteAppointment(id); showToast("Appointment deleted", "success"); loadAppointments(); }
  catch (e) { showToast(e.message, "error"); }
}

document.addEventListener("DOMContentLoaded", () => {
  initProtectedPage();
  loadAppointments();
  document.getElementById("add-btn").addEventListener("click", openAdd);
  document.getElementById("cancel-btn").addEventListener("click", () => modal().classList.remove("open"));
  document.getElementById("status-filter").addEventListener("change", render);
  form().addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form();
    if (!f.patient_id.value) return showToast("Select a patient", "error");
    if (!f.doctor_id.value) return showToast("Select a doctor", "error");
    if (!f.appointment_date.value) return showToast("Choose a date and time", "error");
    const data = {
      patient_id: parseInt(f.patient_id.value, 10), doctor_id: parseInt(f.doctor_id.value, 10),
      appointment_date: f.appointment_date.value + ":00", reason: f.reason.value.trim() || null, status: f.status.value,
    };
    const btn = f.querySelector("button[type=submit]");
    setLoading(btn, true, "Saving...");
    try {
      if (f.dataset.id) { await updateAppointment(f.dataset.id, data); showToast("Appointment updated", "success"); }
      else { await createAppointment(data); showToast("Appointment booked", "success"); }
      modal().classList.remove("open"); loadAppointments();
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(btn, false); }
  });
});
