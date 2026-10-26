// Firebase project keys. These are public identifiers, not secrets.
export const firebaseConfig = {
  apiKey: "AIzaSyD2oyXSorZT0VSin9tey0fL4326CKqEcao",
  authDomain: "movies-website-75f4d.firebaseapp.com",
  projectId: "movies-website-75f4d",
  storageBucket: "movies-website-75f4d.firebasestorage.app",
  messagingSenderId: "947290359489",
  appId: "1:947290359489:web:6b0f9cddbeb38a2d993640"
};

// The single Firestore document that holds the movie link.
export const SETTINGS_DOC = { collection: "config", id: "movie" };

export function isConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}
