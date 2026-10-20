const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldError(id, msg) {
  const input = document.getElementById(id);
  const err = document.getElementById(id + "-error");
  if (input) input.classList.toggle("invalid", !!msg);
  if (err) err.textContent = msg || "";
  return !msg;
}

function showAlert(msg, type = "error") {
  const a = document.getElementById("form-alert");
  a.className = `alert alert-${type} show`;
  a.textContent = msg;
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  if (getToken()) location.href = "dashboard.html";
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    let ok = fieldError("email", !email ? "Email is required" : !EMAIL_RE.test(email) ? "Enter a valid email" : "");
    ok = fieldError("password", !password ? "Password is required" : "") && ok;
    if (!ok) return;
    const btn = loginForm.querySelector("button[type=submit]");
    setLoading(btn, true, "Logging in...");
    try {
      const data = await loginUser({ email, password });
      setToken(data.access_token);
      location.href = "dashboard.html";
    } catch (err) {
      showAlert(err.message);
    } finally { setLoading(btn, false); }
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    let ok = fieldError("name", name.length < 2 ? "Full name is required" : "");
    ok = fieldError("email", !email ? "Email is required" : !EMAIL_RE.test(email) ? "Enter a valid email" : "") && ok;
    ok = fieldError("password", password.length < 6 ? "Password must be at least 6 characters" : "") && ok;
    ok = fieldError("confirm", confirm !== password ? "Passwords do not match" : "") && ok;
    if (!ok) return;
    const btn = registerForm.querySelector("button[type=submit]");
    setLoading(btn, true, "Creating account...");
    try {
      await registerUser({ name, email, password });
      showAlert("Account created! Redirecting to login...", "success");
      setTimeout(() => (location.href = "login.html"), 1200);
    } catch (err) {
      showAlert(err.message);
    } finally { setLoading(btn, false); }
  });
}
