import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProfileAvatar } from '../../utils/profileAvatar'
import { apiFetch } from '../../utils/api'

function PartnerProfile() {
  const { partnerId } = useParams()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await apiFetch(`/api/food/partner/${partnerId}`, {
          credentials: 'include',
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || 'Unable to load this profile.')
        }
        setProfile(result)
      } catch (requestError) {
        setError(requestError.message)
      }
    }

    loadProfile()
  }, [partnerId])

  async function handleDelete(foodId) {
    if (!window.confirm('Delete this reel permanently?')) return
    setDeletingId(foodId)

    try {
      const response = await apiFetch(`/api/food/${foodId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to delete this reel.')

      setProfile((current) => ({
        ...current,
        foodItems: current.foodItems.filter((food) => food._id !== foodId),
      }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingId('')
    }
  }

  if (error) {
    return (
      <main className="profile-page">
        <p className="profile-error">{error}</p>
        <Link className="profile-back-link" to="/">Back to reels</Link>
      </main>
    )
  }

  if (!profile) {
    return <main className="profile-page"><p className="profile-loading">Loading profile...</p></main>
  }

  const { foodPartner, foodItems } = profile
  const signedInPartnerId = localStorage.getItem('zomato-partner-id')
  const canDelete = profile.isOwner || signedInPartnerId === String(foodPartner._id)

  return (
    <main className="profile-page">
      <header className="profile-topbar">
        <Link className="profile-brand" to="/">zomato</Link>
        <Link className="profile-back-link" to="/">Back to reels</Link>
      </header>
      <section className="profile-header">
        <img
          className="profile-avatar"
          src={foodPartner.profileImage || getProfileAvatar(foodPartner._id)}
          alt={`${foodPartner.name} profile`}
        />
        <div className="profile-details">
          <h1>{foodPartner.name}</h1>
          {!canDelete && (
            <Link className="profile-create-button" to={`/chat/${foodPartner._id}`}>Message</Link>
          )}
          <p className="profile-bio">
            Bringing bold flavours, fresh ingredients, and feel-good food to your table.
            Made with love for every craving.
          </p>
          <div className="profile-stats">
            <strong>{foodItems.length}</strong> reels
          </div>
        </div>
      </section>
      <section className="profile-content">
        <h2>Uploaded reels</h2>
        <div className="profile-reel-grid">
          {foodItems.map((food) => (
            <article className="profile-reel" key={food._id}>
              <video src={food.video} muted loop playsInline controls />
              <div>
                <strong>{food.name}</strong>
                <p>{food.description}</p>
                <div className="reel-actions">
                  <span>♥ {(food.likes || []).length}</span>
                  <span>💬 {(food.comments || []).length}</span>
                </div>
                {(food.comments || []).slice(-3).map((comment, index) => (
                  <small key={`${food._id}-${index}`}>{comment.text}</small>
                ))}
                {canDelete && (
                  <button
                    className="delete-reel-button"
                    type="button"
                    disabled={deletingId === food._id}
                    onClick={() => handleDelete(food._id)}
                  >
                    {deletingId === food._id ? 'Deleting...' : 'Delete reel'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default PartnerProfile
