// Remembers who is signed in, in THIS browser only. This is a mock: there is no real login yet.
// Real Google / email sign-in needs a backend (Firebase Auth, Supabase, or your own server).
const SESSION = "aslingo-session";

export const currentUser = () => localStorage.getItem(SESSION);

// Saves the session and returns the id used to store this player's progress.
export function signIn(email) {
  const id = email.trim().toLowerCase();
  localStorage.setItem(SESSION, id);
  return id;
}

export const logout = () => localStorage.removeItem(SESSION);