import { useState } from 'react'
import { useProfile } from './store/profile.js'
import SignIn from './screens/SignIn.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Home from './screens/Home.jsx'
import BottomNav from './components/BottomNav.jsx'

const SOON = {
  games: ['Games', 'Speed Run, Guess the Sign and the weekly leaderboard arrive in Step 6.'],
  battle: ['Sign Battle', 'Head-to-head battles with random players arrive in Step 7.'],
  progress: ['Progress', 'Accuracy per letter and the AI summary arrive in Step 5.'],
}

function Shell({ profile, update, reset }) {
  const [tab, setTab] = useState('home')
  return (
    <>
      <main className="screen with-nav">
        {tab === 'home' && <Home profile={profile} update={update} />}
        {SOON[tab] && (
          <div className="soon">
            <h2 className="title">{SOON[tab][0]}</h2>
            <p>{SOON[tab][1]}</p>
          </div>
        )}
        {tab === 'me' && (
          <div className="soon">
            <h2 className="title">{profile.name}</h2>
            <p>
              Level: {profile.level} · Practice goal: {profile.dailyMinutes} min a day
            </p>
            <button className="btn ghost" onClick={reset}>Sign out and reset</button>
          </div>
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </>
  )
}

export default function App() {
  const { profile, update, reset } = useProfile()

  // Three states of the app: signed out -> answering questions -> inside the app.
  if (!profile.signedIn) {
    return <SignIn onSignIn={(email, provider) => update({ signedIn: true, email, provider })} />
  }
  if (!profile.name || !profile.level || !profile.dailyMinutes) {
    return <Onboarding onDone={update} />
  }
  return <Shell profile={profile} update={update} reset={reset} />
}