document.addEventListener("DOMContentLoaded", async () => {
  await initProtectedPage();
  const tbody = document.getElementById("recent-body");
  try {
    const [patients, doctors, appts] = await Promise.all([getPatients(), getDoctors(), getAppointments()]);
    document.getElementById("stat-patients").textContent = patients.length;
    document.getElementById("stat-doctors").textContent = doctors.length;
    document.getElementById("stat-appointments").textContent = appts.length;
    const recent = appts.slice(0, 5);
    tbody.innerHTML = recent.length ? recent.map((a) => `
      <tr><td>${escapeHtml(a.patient_name)}</td><td>${escapeHtml(a.doctor_name)}</td>
      <td>${formatDate(a.appointment_date)}</td><td>${escapeHtml(a.reason || "-")}</td>
      <td><span class="badge badge-${a.status}">${a.status}</span></td></tr>`).join("")
      : '<tr><td colspan="5" class="empty">No appointments yet</td></tr>';
  } catch (e) {
    showToast(e.message, "error");
    tbody.innerHTML = `<tr><td colspan="5" class="empty">${escapeHtml(e.message)}</td></tr>`;
  }

  // Profile modal
  const modal = document.getElementById("profile-modal");
  document.querySelectorAll("[data-profile]").forEach((el) => el.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const u = await getProfile();
      document.getElementById("p-id").textContent = u.id;
      document.getElementById("p-name").textContent = u.name;
      document.getElementById("p-email").textContent = u.email;
      modal.classList.add("open");
    } catch (err) { showToast(err.message, "error"); }
  }));
  document.getElementById("profile-close").addEventListener("click", () => modal.classList.remove("open"));
  if (location.hash === "#profile") document.querySelector("[data-profile]").click();
});
