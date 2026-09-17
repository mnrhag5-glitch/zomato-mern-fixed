import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProfileAvatar } from '../../utils/profileAvatar'
import { apiFetch } from '../../utils/api'

function UserProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    async function loadProfile() {
      try {
        const sessionResponse = await apiFetch('/api/auth/me', { credentials: 'include' })
        const session = await sessionResponse.json().catch(() => ({}))
        if (session.role === 'partner') {
          navigate('/food-partner/home', { replace: true })
          return
        }
        if (!sessionResponse.ok) throw new Error(session.message || 'Please log in as a user.')
        const response = await apiFetch('/api/food/user/profile', { credentials: 'include' })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.message || 'Unable to load your profile.')
        setProfile(result)
      } catch (requestError) {
        setError(requestError.message)
      }
    }
    loadProfile()
    apiFetch('/api/chat/unread-count', { credentials: 'include' })
      .then((response) => response.json())
      .then((result) => setUnreadCount(result.unreadCount || 0))
      .catch(() => {})
    apiFetch('/api/chat/inbox', { credentials: 'include' })
      .then((response) => response.json())
      .then((result) => setConversations(result.conversations || []))
      .catch(() => {})
  }, [navigate])

  async function handleProfileImage(event) {
    const file = event.target.files[0]
    if (!file) return
    setUploading(true)
    const body = new FormData()
    body.append('profileImage', file)
    try {
      const response = await apiFetch('/api/auth/user/profile-image', {
        method: 'POST',
        credentials: 'include',
        body,
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Unable to upload profile image.')
      setProfile((current) => ({ ...current, user: { ...current.user, profileImage: result.profileImage } }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUploading(false)
    }
  }

  if (error) return <main className="profile-page"><p className="profile-error">{error}</p></main>
  if (!profile) return <main className="profile-page"><p className="profile-loading">Loading profile...</p></main>

  const { user, savedFoodItems } = profile
  return (
    <main className="profile-page">
      <header className="profile-topbar">
        <Link className="profile-brand" to="/">zomato</Link>
        <nav className="profile-nav">
          <Link className="is-active" to="/">Home</Link>
        </nav>
        <Link className="profile-message-link" to="/user/home" aria-label="Open messages">
          <span className="message-icon" aria-hidden="true">✉</span>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </Link>
        <Link className="profile-back-link" to="/">Reels</Link>
      </header>
      <section className="profile-header">
        <label className="profile-avatar-picker">
          <img className="profile-avatar" src={user.profileImage || getProfileAvatar(user._id)} alt={`${user.fullName} profile`} />
          <input type="file" accept="image/*" onChange={handleProfileImage} disabled={uploading} />
          <span>{uploading ? 'Uploading...' : 'Change photo'}</span>
        </label>
        <div className="profile-details">
          <h1>{user.fullName}</h1>
          <p className="profile-bio">Food lover, reel explorer, and always looking for the next delicious bite.</p>
          <div className="profile-stats"><strong>{savedFoodItems.length}</strong> saved reels</div>
        </div>
      </section>
      <section className="profile-content">
        <div className="profile-section-heading">
          <h2>Messages</h2>
          <span>{conversations.length} chats</span>
        </div>
        <div className="chat-inbox">
          {conversations.map((conversation) => (
            <Link
              className="chat-inbox-item"
              key={conversation.partnerId}
              to={`/chat/${conversation.partnerId}`}
            >
              <strong>{conversation.partnerName}</strong>
              <span>{conversation.preview}</span>
            </Link>
          ))}
          {!conversations.length && <p className="profile-empty">No conversations yet.</p>}
        </div>
        <div className="profile-section-heading">
          <h2>Your saved collection</h2>
          <span>{savedFoodItems.length} videos</span>
        </div>
        <div className="profile-reel-grid">
          {savedFoodItems.map((food) => (
            <article className="profile-reel" key={food._id}>
              <video src={food.video} muted loop playsInline controls />
              <div className="profile-reel-info">
                <strong>{food.name}</strong>
                <p>{food.description}</p>
                <div className="reel-actions">
                  <span>♥ {(food.likes || []).length}</span>
                  <span>💬 {(food.comments || []).length}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!savedFoodItems.length && <p className="profile-empty">You have not saved any videos yet.</p>}
      </section>
    </main>
  )
}

export default UserProfile
