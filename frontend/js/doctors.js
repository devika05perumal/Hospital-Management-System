let doctors = [];
const modal = () => document.getElementById("modal");
const form = () => document.getElementById("entity-form");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function loadDoctors() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = '<tr class="loading-row"><td colspan="6"><span class="spinner"></span> Loading...</td></tr>';
  try { doctors = await getDoctors(); render(); }
  catch (e) { tbody.innerHTML = `<tr><td colspan="6" class="empty">${escapeHtml(e.message)}</td></tr>`; showToast(e.message, "error"); }
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  const rows = doctors.filter((d) => d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q));
  document.getElementById("table-body").innerHTML = rows.length ? rows.map((d) => `
    <tr><td>${d.id}</td><td>${escapeHtml(d.name)}</td><td>${escapeHtml(d.specialization)}</td>
    <td>${escapeHtml(d.phone)}</td><td>${escapeHtml(d.email)}</td>
    <td class="actions"><button class="btn btn-outline btn-sm" onclick="openEdit(${d.id})">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="removeDoctor(${d.id})">Delete</button></td></tr>`).join("")
    : '<tr><td colspan="6" class="empty">No doctors found</td></tr>';
}

function openAdd() {
  form().reset(); form().dataset.id = "";
  document.getElementById("modal-title").textContent = "Add Doctor";
  modal().classList.add("open");
}

function openEdit(id) {
  const d = doctors.find((x) => x.id === id); if (!d) return;
  const f = form(); f.dataset.id = id;
  f.name.value = d.name; f.specialization.value = d.specialization; f.phone.value = d.phone; f.email.value = d.email;
  document.getElementById("modal-title").textContent = "Edit Doctor";
  modal().classList.add("open");
}

async function removeDoctor(id) {
  if (!confirm("Delete this doctor? Their appointments will also be removed.")) return;
  try { await deleteDoctor(id); showToast("Doctor deleted", "success"); loadDoctors(); }
  catch (e) { showToast(e.message, "error"); }
}

document.addEventListener("DOMContentLoaded", () => {
  initProtectedPage();
  loadDoctors();
  document.getElementById("add-btn").addEventListener("click", openAdd);
  document.getElementById("cancel-btn").addEventListener("click", () => modal().classList.remove("open"));
  document.getElementById("search").addEventListener("input", render);
  form().addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form();
    const data = { name: f.name.value.trim(), specialization: f.specialization.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim() };
    if (data.name.length < 2) return showToast("Name must be at least 2 characters", "error");
    if (data.specialization.length < 2) return showToast("Specialization is required", "error");
    if (data.phone.length < 5) return showToast("Enter a valid phone number", "error");
    if (!EMAIL_RE.test(data.email)) return showToast("Enter a valid email", "error");
    const btn = f.querySelector("button[type=submit]");
    setLoading(btn, true, "Saving...");
    try {
      if (f.dataset.id) { await updateDoctor(f.dataset.id, data); showToast("Doctor updated", "success"); }
      else { await createDoctor(data); showToast("Doctor added", "success"); }
      modal().classList.remove("open"); loadDoctors();
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(btn, false); }
  });
});
