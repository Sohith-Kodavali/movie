// TV page: the button in index.html already points at the default link.
// This upgrades it with the link saved in Firestore, and caches the last good
// value so the page still works when the network or Firebase is down.
import { firebaseConfig, SETTINGS_DOC, isConfigured } from "./firebase-config.js";

var CACHE_KEY = "movie:url";
var watch = document.querySelector("[data-watch]");

function readCache() {
  try {
    return localStorage.getItem(CACHE_KEY);
  } catch (err) {
    return null;
  }
}

function writeCache(url) {
  try {
    localStorage.setItem(CACHE_KEY, url);
  } catch (err) {
    /* private mode or storage disabled - the default link still works */
  }
}

function applyUrl(url) {
  if (typeof url === "string" && url.trim()) {
    watch.href = url.trim();
  }
}

applyUrl(readCache());

async function sync() {
  if (!isConfigured()) {
    return;
  }

  try {
    var appMod = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js");
    var dbMod = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");

    var app = appMod.initializeApp(firebaseConfig);
    var db = dbMod.getFirestore(app);
    var snap = await dbMod.getDoc(dbMod.doc(db, SETTINGS_DOC.collection, SETTINGS_DOC.id));

    if (snap.exists()) {
      var url = snap.data().url;
      if (url) {
        applyUrl(url);
        writeCache(url);
      }
    }
  } catch (err) {
    // Parents never see an error here: the cached or default link stays in place.
    console.warn("Could not refresh the movie link, keeping the saved one.", err);
  }
}

sync();
