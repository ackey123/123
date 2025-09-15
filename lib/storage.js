// lib/storage.js
const STORAGE_KEY = "expiry-recipe-data";

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}
