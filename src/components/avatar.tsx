import { useEffect, useState } from 'react'
import { supabaseClient } from '../utility/supabaseClient'
import { BaseKey, useUpdate } from '@refinedev/core';
import { IProfile } from './account';

export default function Avatar({ id, url, size, formValues }: { id?: BaseKey; url?: string; size: number; formValues: IProfile}) {
  const [avatarUrl, setAvatarUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  const { mutate } = useUpdate()
  
  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabaseClient.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error: any) {
      console.log('Error downloading image: ', error?.message)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      mutate({
        resource: "profiles",
        values: {
          ...formValues,
          avatar_url: filePath,
        },
        id
      })
      
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="avatar image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="avatar no-image" style={{ height: size, width: size }} />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          name="avatar"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}