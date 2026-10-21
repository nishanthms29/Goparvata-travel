<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GOPARVATA Admin</title>
  <style>
    :root{font-family:Arial,sans-serif;color:#1b2d26;background:#f7f3e8;font-synthesis:none}
    *{box-sizing:border-box}
    body{margin:0}
    header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem max(1rem,calc((100% - 1100px)/2));background:#173d2d;color:#fff}
    header h1{margin:0;font-size:1.2rem}
    header nav{display:flex;flex-wrap:wrap;gap:.75rem}
    a{color:inherit}
    header a{font-size:.9rem}
    main{max-width:1100px;margin:2rem auto;padding:0 1rem}
    .tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.2rem}
    button{font:inherit;cursor:pointer}
    .tabs button,.action{border:0;border-radius:5px;padding:.65rem .9rem;background:#173d2d;color:#fff}
    .tabs button[aria-pressed=true]{background:#c99a3a;color:#1b2d26}
    .panel{display:none;background:#fff;border:1px solid #d3dedb;border-radius:8px;padding:1.2rem}
    .panel.active{display:block}
    h2{margin:.1rem 0 1rem;font-size:1.35rem}
    form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.85rem;margin-bottom:1.3rem}
    label{display:flex;flex-direction:column;gap:.35rem;font-size:.9rem;font-weight:600}
    label.full{grid-column:1/-1}
    input,select,textarea{width:100%;font:inherit;padding:.6rem;border:1px solid #e4ddcd;border-radius:5px;background:#fffdf7;color:#1b2d26}
    input[type=checkbox]{width:auto}
    .check{flex-direction:row;align-items:center}
    .item{border-top:1px solid #d3dedb;padding:1rem 0}
    .item h3{margin:0 0 .35rem}
    .item p{margin:.25rem 0;white-space:pre-wrap;overflow-wrap:anywhere}
    .item form{margin:.7rem 0 0}
    .item-actions{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
    .danger{background:#a53125}
    .muted{color:#4d6770}
    #notice{margin:0 0 1rem;padding:.8rem;border-radius:5px;background:#e6f1ec}
    #notice.error{background:#fbe9e7;color:#9c241a}
    #login-panel{max-width:430px;background:#fff;border:1px solid #d3dedb;border-radius:8px;padding:1.2rem}
    #login-panel form{grid-template-columns:1fr}
    #login-notice{margin:.75rem 0 0;color:#9c241a}
    [hidden]{display:none!important}
    @media(max-width:620px){header{align-items:flex-start;flex-direction:column}form{grid-template-columns:1fr}label.full{grid-column:auto}}
  </style>
</head>
<body>
<header>
  <h1><span data-brand-name>GOPARVATA</span> Admin</h1>
  <nav>
    <a href="../index.html">View travel site</a>
    <button id="logout" type="button" hidden>Log out</button>
  </nav>
</header>
<main>
  <section id="login-panel">
    <h2><span data-brand-name>GOPARVATA</span> admin sign in</h2>
    <p class="muted">Use the travel administrator credentials configured on the server.</p>
    <form id="login-form">
      <label>Email<input name="email" type="email" autocomplete="username" required maxlength="190"></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
      <button class="action" type="submit">Sign in</button>
    </form>
    <p id="login-notice" role="status" aria-live="polite" hidden></p>
  </section>
</main>
<main id="admin-panel" hidden>
  <div id="notice" role="status" aria-live="polite" hidden></div>
  <div class="tabs" role="tablist" aria-label="Travel administration">
    <button type="button" data-panel="enquiries" aria-pressed="true">Enquiries</button>
    <button type="button" data-panel="destinations" aria-pressed="false">Destinations & packages</button>
    <button type="button" data-panel="settings" aria-pressed="false">Homepage content</button>
  </div>

  <section class="panel active" id="panel-enquiries" aria-labelledby="enquiries-heading">
    <h2 id="enquiries-heading">Trip enquiries</h2>
    <p class="muted">Review each request and track whether your team has contacted the traveller.</p>
    <div id="enquiry-list"></div>
  </section>

  <section class="panel" id="panel-destinations" aria-labelledby="destinations-heading">
    <h2 id="destinations-heading">Destinations and packages</h2>
    <p class="muted">Edit, add, reorder, or hide packages shown on the public homepage.</p>
    <form id="destination-form">
      <input type="hidden" name="id" value="0">
      <label>Destination name<input name="name" maxlength="100" required></label>
      <label>Category<select name="category" required><option value="beach">Beach</option><option value="mountain">Mountain</option><option value="culture">Culture</option><option value="city">City</option></select></label>
      <label class="full">Package description<input name="description" maxlength="255" required></label>
      <label>Starting price label<input name="price_label" maxlength="80" placeholder="₹32,000" required></label>
      <label>Display order<input name="sort_order" type="number" min="0" max="10000" value="0" required></label>
      <label>Background start color<input name="gradient_start" type="color" value="#0f7c8a" required></label>
      <label>Background end color<input name="gradient_end" type="color" value="#7fd1c7" required></label>
      <label class="check"><input name="is_active" type="checkbox" checked> Show on website</label>
      <div class="item-actions full">
        <button class="action" type="submit">Save destination</button>
        <button class="action" id="clear-destination" type="button">Clear form</button>
      </div>
    </form>
    <div id="destination-list"></div>
  </section>

  <section class="panel" id="panel-settings" aria-labelledby="settings-heading">
    <h2 id="settings-heading">Homepage content and contact details</h2>
    <p class="muted">Changes are stored in the database and appear on the public travel homepage.</p>
    <form id="settings-form">
      <label>Contact phone<input name="contact_phone" maxlength="40" required></label>
      <label class="full">Homepage headline<input name="hero_title" maxlength="240" required></label>
      <label class="full">Homepage introduction<textarea name="hero_intro" maxlength="500" rows="3" required></textarea></label>
      <label>Destinations heading<input name="destinations_title" maxlength="160" required></label>
      <label>Why us heading<input name="why_title" maxlength="160" required></label>
      <label class="full">Destinations introduction<textarea name="destinations_intro" maxlength="500" rows="2" required></textarea></label>
      <label class="full">Why us introduction<textarea name="why_intro" maxlength="500" rows="2" required></textarea></label>
      <label>Benefit one heading<input name="benefit_one_title" maxlength="120" required></label>
      <label>Benefit two heading<input name="benefit_two_title" maxlength="120" required></label>
      <label class="full">Benefit one text<textarea name="benefit_one_copy" maxlength="300" rows="2" required></textarea></label>
      <label class="full">Benefit two text<textarea name="benefit_two_copy" maxlength="300" rows="2" required></textarea></label>
      <label>Benefit three heading<input name="benefit_three_title" maxlength="120" required></label>
      <label>Benefit three text<textarea name="benefit_three_copy" maxlength="300" rows="2" required></textarea></label>
      <label>Trip planner heading<input name="plan_title" maxlength="160" required></label>
      <label>Contact email<input name="contact_email" type="email" maxlength="190" required></label>
      <label class="full">Trip planner introduction<textarea name="plan_intro" maxlength="500" rows="2" required></textarea></label>
      <button class="action" type="submit">Save homepage content</button>
    </form>
  </section>
</main>
<script src="../brand.js" defer></script>
<script>
let csrfToken = "";
const apiUrl = "api/travel.php";
const notice = document.getElementById("notice");
const loginPanel = document.getElementById("login-panel");
const loginForm = document.getElementById("login-form");
const loginNotice = document.getElementById("login-notice");
const adminPanel = document.getElementById("admin-panel");
const logoutButton = document.getElementById("logout");
const enquiryList = document.getElementById("enquiry-list");
const destinationList = document.getElementById("destination-list");
const destinationForm = document.getElementById("destination-form");
const settingsForm = document.getElementById("settings-form");

function showNotice(message, isError = false) {
  notice.hidden = false;
  notice.classList.toggle("error", isError);
  notice.textContent = message;
}

async function api(action, method = "GET", body = null) {
  const options = { method, headers: { Accept: "application/json" } };
  if (body !== null) {
    options.headers["Content-Type"] = "application/json";
    if (csrfToken) options.headers["X-CSRF-Token"] = csrfToken;
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${apiUrl}?action=${encodeURIComponent(action)}`, options);
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || `Request failed (${response.status}).`);
  return result;
}

function addText(parent, tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

async function loadEnquiries() {
  const result = await api("enquiries");
  enquiryList.replaceChildren();
  if (!result.enquiries.length) {
    addText(enquiryList, "p", "No trip requests yet.", "muted");
    return;
  }
  result.enquiries.forEach((enquiry) => {
    const item = document.createElement("article");
    item.className = "item";
    addText(item, "h3", `${enquiry.full_name} — ${enquiry.destination_name}`);
    addText(item, "p", `${enquiry.email} · ${enquiry.travellers} traveller(s) · ${enquiry.created_at}`);
    if (enquiry.notes) addText(item, "p", enquiry.notes);
    const controls = document.createElement("div");
    controls.className = "item-actions";
    const status = document.createElement("select");
    status.setAttribute("aria-label", `Enquiry status for ${enquiry.full_name}`);
    [["new", "New"], ["contacted", "Contacted"], ["closed", "Closed"]].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;option.textContent = label;option.selected = value === enquiry.status;status.appendChild(option);
    });
    const save = document.createElement("button");
    save.type = "button";save.className = "action";save.textContent = "Update status";
    save.addEventListener("click", async () => {
      try { await api("update_status", "POST", { id: enquiry.id, status: status.value });showNotice("Enquiry status updated."); }
      catch (error) { showNotice(error.message, true); }
    });
    controls.append(status, save);item.appendChild(controls);enquiryList.appendChild(item);
  });
}

function setDestinationForm(destination) {
  const values = destination || { id: 0, name: "", category: "beach", description: "", price_label: "", sort_order: 0, gradient_start: "#0f7c8a", gradient_end: "#7fd1c7", is_active: true };
  Object.entries(values).forEach(([key, value]) => {
    const field = destinationForm.elements.namedItem(key);
    if (!field) return;
    if (field.type === "checkbox") field.checked = Boolean(Number(value));
    else field.value = value;
  });
  destinationForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadDestinations() {
  const result = await api("destinations");
  destinationList.replaceChildren();
  result.destinations.forEach((destination) => {
    const item = document.createElement("article");
    item.className = "item";
    addText(item, "h3", `${destination.name} — ${destination.price_label}`);
    addText(item, "p", `${destination.category} · ${destination.description} · ${Number(destination.is_active) ? "Visible" : "Hidden"}`);
    const controls = document.createElement("div");controls.className = "item-actions";
    const edit = document.createElement("button");edit.type = "button";edit.className = "action";edit.textContent = "Edit";
    edit.addEventListener("click", () => setDestinationForm(destination));
    const remove = document.createElement("button");remove.type = "button";remove.className = "action danger";remove.textContent = "Delete";
    remove.addEventListener("click", async () => {
      if (!window.confirm(`Delete ${destination.name}? Existing enquiries will be kept.`)) return;
      try { await api("delete_destination", "POST", { id: destination.id });showNotice("Destination deleted.");await loadDestinations(); }
      catch (error) { showNotice(error.message, true); }
    });
    controls.append(edit, remove);item.appendChild(controls);destinationList.appendChild(item);
  });
}

async function loadSettings() {
  const result = await api("settings");
  Object.entries(result.settings).forEach(([key, value]) => {
    const field = settingsForm.elements.namedItem(key);
    if (field) field.value = value;
  });
}

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll(".tabs button").forEach((tab) => tab.setAttribute("aria-pressed", String(tab === button)));
    document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === `panel-${button.dataset.panel}`));
    try {
      if (button.dataset.panel === "enquiries") await loadEnquiries();
      if (button.dataset.panel === "destinations") await loadDestinations();
      if (button.dataset.panel === "settings") await loadSettings();
    } catch (error) { showNotice(error.message, true); }
  });
});

destinationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(destinationForm).entries());
  payload.id = Number(payload.id);payload.sort_order = Number(payload.sort_order);
  payload.is_active = destinationForm.elements.namedItem("is_active").checked;
  try {
    const result = await api("save_destination", "POST", payload);
    showNotice(result.message);setDestinationForm();await loadDestinations();
  } catch (error) { showNotice(error.message, true); }
});

document.getElementById("clear-destination").addEventListener("click", () => setDestinationForm());
settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try { const result = await api("save_settings", "POST", Object.fromEntries(new FormData(settingsForm).entries()));showNotice(result.message); }
  catch (error) { showNotice(error.message, true); }
});

function showAdmin() {
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  logoutButton.hidden = false;
}

function showLoginError(message) {
  loginNotice.hidden = false;
  loginNotice.textContent = message;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginNotice.hidden = true;
  const credentials = Object.fromEntries(new FormData(loginForm).entries());
  try {
    const result = await api("admin_login", "POST", credentials);
    csrfToken = result.csrf_token;
    loginForm.reset();
    showAdmin();
    try { await loadEnquiries(); }
    catch (error) { showNotice(error.message, true); }
  } catch (error) {
    showLoginError(error.message);
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    await api("admin_logout", "POST", {});
    csrfToken = "";
    adminPanel.hidden = true;
    loginPanel.hidden = false;
    logoutButton.hidden = true;
  } catch (error) { showNotice(error.message, true); }
});

api("admin_status").then((result) => {
  if (!result.authenticated) return;
  csrfToken = result.csrf_token;
  showAdmin();
  return loadEnquiries();
}).catch((error) => {
  if (loginPanel.hidden) showNotice(error.message, true);
  else showLoginError(error.message);
});
</script>
</body>
</html>
