// Accounts saved in THIS browser only. Passwords are salted + hashed, but this is a demo:
// real accounts need a backend (Firebase Auth, Supabase, or your own server).
const USERS = "aslingo-users", SESSION = "aslingo-session";
const users = () => JSON.parse(localStorage.getItem(USERS) || "{}");
const hash = async (pw, salt) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + pw));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};
const clean = (n) => n.trim().toLowerCase();

export const currentUser = () => localStorage.getItem(SESSION);
export const logout = () => localStorage.removeItem(SESSION);
export const listUsers = () => Object.keys(users()); // names shown on the login screen

// Each returns an error message, or null when it worked.
export async function signup(name, pw) {
  name = clean(name);
  if (name.length < 3) return "Username needs at least 3 characters";
  if (pw.length < 6) return "Password needs at least 6 characters";
  const all = users();
  if (all[name]) return "That username is taken";
  const salt = crypto.randomUUID();
  all[name] = { salt, hash: await hash(pw, salt) };
  localStorage.setItem(USERS, JSON.stringify(all));
  localStorage.setItem(SESSION, name);
  return null;
}
export async function login(name, pw) {
  name = clean(name);
  const rec = users()[name];
  if (!rec || rec.hash !== (await hash(pw, rec.salt))) return "Wrong username or password";
  localStorage.setItem(SESSION, name);
  return null;
}