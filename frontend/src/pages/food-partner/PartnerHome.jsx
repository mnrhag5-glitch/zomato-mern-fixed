import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfileAvatar } from '../../utils/profileAvatar'
import { apiFetch } from '../../utils/api'

function PartnerHome() {
  const partnerId = localStorage.getItem('zomato-partner-id')
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [inbox, setInbox] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!partnerId) {
      setError('Please log in as a food partner to view your profile.')
      return
    }

    async function loadProfile() {
      try {
        const response = await apiFetch(`/api/food/partner/${partnerId}`, {
          credentials: 'include',
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Unable to load your profile.')
        setProfile(result)
      } catch (requestError) {
        setError(requestError.message)
      }
    }

    loadProfile()
    apiFetch('/api/chat/inbox', { credentials: 'include' })
      .then((response) => response.json())
      .then((result) => setInbox(result.conversations || []))
      .catch(() => {})
    apiFetch('/api/chat/unread-count', { credentials: 'include' })
      .then((response) => response.json())
      .then((result) => setUnreadCount(result.unreadCount || 0))
      .catch(() => {})
  }, [partnerId])

  async function handleProfileImage(event) {
    const file = event.target.files[0]
    if (!file) return
    setUploading(true)
    const body = new FormData()
    body.append('profileImage', file)
    try {
      const response = await apiFetch('/api/auth/food-partner/profile-image', {
        method: 'POST',
        credentials: 'include',
        body,
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Unable to upload profile image.')
      setProfile((current) => ({ ...current, foodPartner: { ...current.foodPartner, profileImage: result.profileImage } }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUploading(false)
    }
  }

  if (error) {
    return <main className="profile-page"><p className="profile-error">{error}</p></main>
  }

  if (!profile) {
    return <main className="profile-page"><p className="profile-loading">Loading your profile...</p></main>
  }

  const { foodPartner, foodItems } = profile

  return (
    <main className="profile-page">
      <header className="profile-topbar">
        <Link className="profile-brand" to="/">zomato</Link>
        <Link className="profile-message-link" to="#messages" aria-label="Open messages">
          <span className="message-icon" aria-hidden="true">✉</span>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </Link>
        <Link className="profile-back-link" to="/">View reels</Link>
      </header>
      <section className="profile-header partner-own-header">
        <label className="profile-avatar-picker">
          <img className="profile-avatar" src={foodPartner.profileImage || getProfileAvatar(foodPartner._id)} alt={`${foodPartner.name} profile`} />
          <input type="file" accept="image/*" onChange={handleProfileImage} disabled={uploading} />
          <span>{uploading ? 'Uploading...' : 'Change photo'}</span>
        </label>
        <div className="profile-details">
          <div className="profile-title-row">
            <h1>{foodPartner.name}</h1>
            <Link className="profile-create-button" to="/create-food-partner">Create a reel <span>+</span></Link>
          </div>
          <p className="profile-bio">Bringing bold flavours, fresh ingredients, and feel-good food to your table. Made with love for every craving.</p>
          <div className="profile-stats">
            <strong>{foodItems.length}</strong> reels
          </div>
        </div>
      </section>
      <section className="profile-content">
        <div className="profile-section-heading" id="messages">
          <h2>Messages</h2>
          <span>{inbox.length} conversations</span>
        </div>
        <div className="chat-inbox">
          {inbox.map((conversation) => (
            <Link className="chat-inbox-item" key={conversation.userId} to={`/chat/${foodPartner._id}?userId=${conversation.userId}`}>
              <strong>{conversation.userName}</strong>
              <span>{conversation.preview}</span>
            </Link>
          ))}
          {!inbox.length && <p className="profile-empty">No messages yet.</p>}
        </div>
        <div className="profile-section-heading">
          <h2>Your dashboard</h2>
          <span>{foodItems.length} published reels</span>
        </div>
        <div className="profile-reel-grid">
          {foodItems.map((food) => {
            return (
              <article className="profile-reel" key={food._id}>
                <video src={food.video} muted loop playsInline controls />
                <div className="profile-reel-info">
                  <strong>{food.name}</strong>
                  <p>{food.description}</p>
                  <div className="reel-actions">
                    <span>♥ {(food.likes || []).length}</span>
                    <span>💬 {(food.comments || []).length}</span>
                  </div>
                  {(food.comments || []).slice(-3).map((comment, index) => (
                    <small key={`${food._id}-${index}`}>{comment.text}</small>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default PartnerHome
