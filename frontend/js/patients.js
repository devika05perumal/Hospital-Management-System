let patients = [];
const modal = () => document.getElementById("modal");
const form = () => document.getElementById("entity-form");

async function loadPatients() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = '<tr class="loading-row"><td colspan="7"><span class="spinner"></span> Loading...</td></tr>';
  try { patients = await getPatients(); render(); }
  catch (e) { tbody.innerHTML = `<tr><td colspan="7" class="empty">${escapeHtml(e.message)}</td></tr>`; showToast(e.message, "error"); }
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  const rows = patients.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q));
  document.getElementById("table-body").innerHTML = rows.length ? rows.map((p) => `
    <tr><td>${p.id}</td><td>${escapeHtml(p.name)}</td><td>${p.age}</td><td>${p.gender}</td>
    <td>${escapeHtml(p.phone)}</td><td>${escapeHtml(p.address || "-")}</td>
    <td class="actions"><button class="btn btn-outline btn-sm" onclick="openEdit(${p.id})">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="removePatient(${p.id})">Delete</button></td></tr>`).join("")
    : '<tr><td colspan="7" class="empty">No patients found</td></tr>';
}

function openAdd() {
  form().reset(); form().dataset.id = "";
  document.getElementById("modal-title").textContent = "Add Patient";
  modal().classList.add("open");
}

function openEdit(id) {
  const p = patients.find((x) => x.id === id); if (!p) return;
  const f = form(); f.dataset.id = id;
  f.name.value = p.name; f.age.value = p.age; f.gender.value = p.gender; f.phone.value = p.phone; f.address.value = p.address || "";
  document.getElementById("modal-title").textContent = "Edit Patient";
  modal().classList.add("open");
}

async function removePatient(id) {
  if (!confirm("Delete this patient? Their appointments will also be removed.")) return;
  try { await deletePatient(id); showToast("Patient deleted", "success"); loadPatients(); }
  catch (e) { showToast(e.message, "error"); }
}

document.addEventListener("DOMContentLoaded", () => {
  initProtectedPage();
  loadPatients();
  document.getElementById("add-btn").addEventListener("click", openAdd);
  document.getElementById("cancel-btn").addEventListener("click", () => modal().classList.remove("open"));
  document.getElementById("search").addEventListener("input", render);
  form().addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form();
    const data = { name: f.name.value.trim(), age: parseInt(f.age.value, 10), gender: f.gender.value, phone: f.phone.value.trim(), address: f.address.value.trim() || null };
    if (data.name.length < 2) return showToast("Name must be at least 2 characters", "error");
    if (isNaN(data.age) || data.age < 0 || data.age > 150) return showToast("Enter a valid age", "error");
    if (!data.gender) return showToast("Select a gender", "error");
    if (data.phone.length < 5) return showToast("Enter a valid phone number", "error");
    const btn = f.querySelector("button[type=submit]");
    setLoading(btn, true, "Saving...");
    try {
      if (f.dataset.id) { await updatePatient(f.dataset.id, data); showToast("Patient updated", "success"); }
      else { await createPatient(data); showToast("Patient added", "success"); }
      modal().classList.remove("open"); loadPatients();
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(btn, false); }
  });
});
