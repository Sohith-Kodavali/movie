import { firebaseConfig, SETTINGS_DOC, isConfigured } from "./firebase-config.js";

var form = document.querySelector("[data-form]");
var input = document.querySelector("[data-url]");
var saveButton = document.querySelector("[data-save]");
var statusEl = document.querySelector("[data-status]");
var currentEl = document.querySelector("[data-current]");
var updatedEl = document.querySelector("[data-updated]");

var fb = null;

function setStatus(message, tone) {
  statusEl.textContent = message;
  statusEl.setAttribute("data-tone", tone || "info");
}

function describeError(err) {
  var code = (err && err.code) || "";
  if (code === "permission-denied") {
    return "Firestore refused the request. Publish the rules in firestore.rules and make sure the database exists.";
  }
  if (code === "unavailable" || code === "deadline-exceeded") {
    return "Can't reach Firestore. Check your connection, then reload.";
  }
  if (code === "failed-precondition") {
    return "Firestore isn't enabled for this project yet. Create the database in the Firebase console.";
  }
  if (code === "not-found") {
    return "That Firestore database doesn't exist. Create it in the Firebase console.";
  }
  if (code === "invalid-api-key" || code === "app/invalid-api-key") {
    return "The apiKey in js/firebase-config.js is wrong. Copy the config again from Project settings.";
  }
  return (err && err.message) || "Something went wrong. Try again.";
}

async function getFirebase() {
  if (!fb) {
    var appMod = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js");
    var dbMod = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
    var app = appMod.initializeApp(firebaseConfig);
    fb = { db: dbMod.getFirestore(app), fs: dbMod };
  }
  return fb;
}

function normalize(raw) {
  var value = String(raw || "").trim();
  if (!value) {
    return { error: "Paste the movie link first." };
  }
  if (!/^[a-z]+:\/\//i.test(value)) {
    value = "https://" + value;
  }
  var parsed;
  try {
    parsed = new URL(value);
  } catch (err) {
    return { error: "That doesn't look like a link. Try https://example.com/movie" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "The link has to start with http:// or https://" };
  }
  return { url: parsed.href };
}

function renderCurrent(url) {
  currentEl.textContent = url || "No link saved yet.";
}

async function loadCurrent() {
  var fb = await getFirebase();
  var ref = fb.fs.doc(fb.db, SETTINGS_DOC.collection, SETTINGS_DOC.id);
  var snap = await fb.fs.getDoc(ref);

  if (!snap.exists()) {
    renderCurrent("");
    updatedEl.textContent = "";
    return;
  }

  var data = snap.data();
  renderCurrent(data.url);
  if (data.url) {
    input.value = data.url;
  }
  var when = data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate() : null;
  updatedEl.textContent = when ? "Last saved " + when.toLocaleString() : "";
}

async function init() {
  if (!isConfigured()) {
    setStatus(
      "Firebase isn't set up yet. Paste your project keys into js/firebase-config.js, then reload this page.",
      "error"
    );
    input.disabled = true;
    saveButton.disabled = true;
    renderCurrent("");
    return;
  }

  setStatus("Loading the current link\u2026", "info");
  try {
    await loadCurrent();
    setStatus("", "info");
  } catch (err) {
    setStatus(describeError(err), "error");
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  var result = normalize(input.value);
  if (result.error) {
    setStatus(result.error, "error");
    input.focus();
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Saving\u2026";
  setStatus("", "info");

  try {
    var fb = await getFirebase();
    var ref = fb.fs.doc(fb.db, SETTINGS_DOC.collection, SETTINGS_DOC.id);
    await fb.fs.setDoc(ref, { url: result.url, updatedAt: fb.fs.serverTimestamp() });

    input.value = result.url;
    renderCurrent(result.url);
    updatedEl.textContent = "Last saved " + new Date().toLocaleString();
    setStatus("Saved. The TV uses this link the next time the page loads.", "success");
  } catch (err) {
    setStatus(describeError(err), "error");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Save link";
  }
});

init();
