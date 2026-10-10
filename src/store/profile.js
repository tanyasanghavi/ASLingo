import { useEffect, useState } from 'react'

// Everything about the player lives in one object, saved in the browser.
// Later we swap localStorage for a real database so it follows you across devices.
const KEY = 'aslingo.profile.v1'

const EMPTY = {
  signedIn: false,
  email: null,
  provider: null,
  name: '',
  level: null, // 'beginner' | 'some' | 'advanced'
  dailyMinutes: null, // 5 | 10 | 20
  streak: 0,
  xp: 0,
  completed: [], // lesson ids, e.g. 'alphabet-1'
}

function load() {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY)) }
  } catch {
    return EMPTY
  }
}

export function useProfile() {
  const [profile, setProfile] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(profile))
  }, [profile])

  const update = (patch) => setProfile((p) => ({ ...p, ...patch }))
  const reset = () => setProfile(EMPTY)

  return { profile, update, reset }
}