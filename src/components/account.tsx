import { useState, useEffect } from 'react'
import { supabaseClient } from '../utility/supabaseClient'
import { useGetIdentity } from '@refinedev/core'

export default function Account() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  
  const { data: userIdentity } = useGetIdentity<{
    id: "number";
    name: "string"
  }>();

  useEffect(() => {
    async function getProfile() {
      setLoading(true)

      let { data, error } = await supabaseClient
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', userIdentity?.id)
        .single()

      if (error) {
        console.warn(error)
      } else if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }

      setLoading(false)
    }

    getProfile()
  }, [userIdentity])

  async function updateProfile(event: { preventDefault: () => void }) {
    event.preventDefault()

    setLoading(true)

    const updates = {
      id: userIdentity?.id,
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    }

    let { error } = await supabaseClient.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={updateProfile} className="form-widget">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={userIdentity?.name} disabled />
      </div>
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          type="text"
          required
          value={username || ''}
          onChange={(e: any) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="url"
          value={website || ''}
          onChange={(e: any) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <button className="button block primary" type="submit" disabled={loading}>
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" type="button" onClick={() => supabaseClient.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </form>
  )
}