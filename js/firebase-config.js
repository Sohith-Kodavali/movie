// Paste your Firebase project keys here.
// Firebase console -> your project -> Project settings (gear) -> Your apps -> Web app -> SDK setup and configuration.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// The single Firestore document that holds the movie link.
export const SETTINGS_DOC = { collection: "config", id: "movie" };

export function isConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}
