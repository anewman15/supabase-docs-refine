import { useState, useEffect } from 'react'
import { supabaseClient } from '../utility/supabaseClient'
import { HttpError, useGetIdentity, useIsAuthenticated, useLogout, useOne } from '@refinedev/core'
import Avatar from './avatar'

interface IProfile {
  id: string;
  username: string;
  website: string;
  avatar_url: string;
}

export default function Account() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | undefined>("")
  const [website, setWebsite] = useState<string | undefined>("")
  const [avatar_url, setAvatarUrl] = useState<string | undefined>("")
  
  const { data: userIdentity } = useGetIdentity<{
    id: "number";
    name: "string"
  }>();

  const { data: authenticationStatus } = useIsAuthenticated();
  const { mutate: logOut } = useLogout();

  const { data: userProfileData, isLoading, isError } = useOne<IProfile, HttpError>({
    resource: "profiles",
    id: userIdentity?.id,
  })

  const userProfile = userProfileData?.data;

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

  console.log(username)
  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      <form onSubmit={updateProfile} className="form-widget">
        <Avatar
        url={userProfile?.avatar_url}
        size={150}
        onUpload={(event: any, url: any) => {
          setAvatarUrl(url)
          updateProfile(event)
        }}
      />
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
            value={userProfile?.username}
            onChange={(e: any) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="url"
            value={userProfile?.website ?? ''}
            onChange={(e: any) => setWebsite(e.target.value)}
          />
        </div>

        <div>
          <button className="button block primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Loading ...' : 'Update'}
          </button>
        </div>

        <div>
          <button className="button block" type="button" onClick={() => logOut()}>
            Sign Out
          </button>
        </div>
      </form>
    </div>
  )
}