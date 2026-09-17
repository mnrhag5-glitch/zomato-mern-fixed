import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../../utils/api'

const fallbackReels = [
  {
    _id: 'demo-1',
    name: 'Fresh flavours, made daily',
    description: 'Discover delicious dishes from local restaurants around you.',
    video: '',
  },
  {
    _id: 'demo-2',
    name: 'Something delicious is waiting',
    description: 'Scroll through the latest food discoveries and find your next favourite meal.',
    video: '',
  },
  {
    _id: 'demo-3',
    name: 'Made for your next craving',
    description: 'Explore local flavours, discover new places, and order what looks good.',
    video: '',
  },
]

function Home() {
  const [foodItems, setFoodItems] = useState([])
  const [error, setError] = useState('')
  const [commentDrafts, setCommentDrafts] = useState({})
  const [actionError, setActionError] = useState('')
  const feedRef = useRef(null)
  const videoRefs = useRef(new Map())
  const manuallyPausedVideos = useRef(new Set())

  async function readResponse(response) {
    const text = await response.text()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch (error) {
      throw new Error('Server returned an invalid response. Please restart the backend.')
    }
  }

  useEffect(() => {
    async function loadFoodItems() {
      try {
        const response = await apiFetch('/api/food', { credentials: 'include' })
        const result = await readResponse(response)
        if (!response.ok) {
          throw new Error(result.message || 'Unable to load food reels.')
        }
        setFoodItems(result.foodItems || [])
      } catch (requestError) {
        setError(requestError.message)
      }
    }

    loadFoodItems()
  }, [])

  const reels = foodItems.length ? foodItems : fallbackReels

  useEffect(() => {
    const feed = feedRef.current
    if (!feed) return undefined

    function playMostVisibleVideo() {
      const cards = [...feed.querySelectorAll('.reel-card')]
      let mostVisibleCard = null
      let largestVisibleHeight = 0

      cards.forEach((card) => {
        const bounds = card.getBoundingClientRect()
        const visibleHeight = Math.max(
          0,
          Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0),
        )

        if (visibleHeight > largestVisibleHeight) {
          largestVisibleHeight = visibleHeight
          mostVisibleCard = card
        }
      })

      videoRefs.current.forEach((video) => {
        const videoId = [...videoRefs.current.entries()]
          .find(([, currentVideo]) => currentVideo === video)?.[0]

        if (video.closest('.reel-card') === mostVisibleCard && !manuallyPausedVideos.current.has(videoId)) {
          void video.play()
        } else {
          video.pause()
        }
      })
    }

    const observer = new IntersectionObserver(playMostVisibleVideo, {
      root: feed,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    })
    feed.querySelectorAll('.reel-card').forEach((card) => observer.observe(card))
    playMostVisibleVideo()

    return () => observer.disconnect()
  }, [reels.length])

  async function handleLike(foodId) {
    setActionError('')
    try {
      const response = await apiFetch(`/api/food/${foodId}/like`, { method: 'POST', credentials: 'include' })
      const result = await readResponse(response)
      if (!response.ok) throw new Error(result.message || 'Please log in to like reels.')
      setFoodItems((current) => current.map((food) => food._id === foodId
        ? { ...food, likes: Array(result.likesCount).fill('like') }
        : food))
    } catch (requestError) {
      setActionError(requestError.message)
    }
  }

  async function handleSave(foodId) {
    setActionError('')
    try {
      const response = await apiFetch(`/api/food/${foodId}/save`, { method: 'POST', credentials: 'include' })
      const result = await readResponse(response)
      if (!response.ok) throw new Error(result.message || 'Please log in to save reels.')
      setFoodItems((current) => current.map((food) => food._id === foodId
        ? { ...food, savedBy: result.saved ? ['saved'] : [] }
        : food))
    } catch (requestError) {
      setActionError(requestError.message)
    }
  }

  async function handleComment(event, foodId) {
    event.preventDefault()
    const text = commentDrafts[foodId]?.trim()
    if (!text) return
    setActionError('')
    try {
      const response = await apiFetch(`/api/food/${foodId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      })
      const result = await readResponse(response)
      if (!response.ok) throw new Error(result.message || 'Please log in to comment on reels.')
      setFoodItems((current) => current.map((food) => food._id === foodId ? { ...food, comments: result.comments } : food))
      setCommentDrafts((current) => ({ ...current, [foodId]: '' }))
    } catch (requestError) {
      setActionError(requestError.message)
    }
  }

  function handleVideoClick(id) {
    const video = videoRefs.current.get(id)
    if (!video) return

    if (video.paused) {
      manuallyPausedVideos.current.delete(id)
      void video.play()
    } else {
      manuallyPausedVideos.current.add(id)
      video.pause()
    }

  }

  return (
    <main className="reels-page">
      <header className="reels-header">
        <Link className="reels-brand" to="/">zomato</Link>
        <nav className="reels-nav">
          <Link className="is-active" to="/">Home</Link>
          <Link to="/user/home">Profile</Link>
        </nav>
        <Link className="reels-login" to="/user/login">Account</Link>
      </header>
      {error && <p className="reels-error">{error}</p>}
      {actionError && <p className="reels-action-error">{actionError}</p>}
      <section className="reels-feed" ref={feedRef} aria-label="Food videos">
        {reels.map((food) => (
          <article
            className="reel-card"
            key={food._id}
          >
            {food.video ? (
              <video
                className="reel-video"
                src={food.video}
                autoPlay
                muted
                loop
                playsInline
                onClick={(event) => {
                  event.stopPropagation()
                  handleVideoClick(food._id)
                }}
                ref={(video) => {
                  if (video) {
                    videoRefs.current.set(food._id, video)
                  } else {
                    videoRefs.current.delete(food._id)
                  }
                }}
              />
            ) : (
              <div className="reel-placeholder" aria-label="Video preview">
                <span>Food reels</span>
              </div>
            )}
            <div className="reel-overlay">
              <div className="reel-copy">
                <h1>{food.name}</h1>
                <p>{food.description || 'Taste something special from a local food partner.'}</p>
                {food.foodPartner && (
                  <Link className="visit-store-button" to={`/food-partner/profile/${food.foodPartner}`}>
                    View profile <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
              {food._id && food.video && (
                <div className="reel-action-rail">
                  <button type="button" onClick={() => handleLike(food._id)}>
                    <span>{(food.likes || []).length ? '♥' : '♡'}</span>
                    {(food.likes || []).length}
                  </button>
                  <button type="button" onClick={() => document.getElementById(`comment-${food._id}`)?.focus()}>
                    <span>💬</span>{(food.comments || []).length}
                  </button>
                  <button type="button" onClick={() => handleSave(food._id)}>
                    <span>{(food.savedBy || []).length ? '🔖' : '♡'}</span>
                    Save
                  </button>
                </div>
              )}
              {food._id && food.video && (
                <div className="reel-engagement">
                  <form onSubmit={(event) => handleComment(event, food._id)}>
                    <input id={`comment-${food._id}`} value={commentDrafts[food._id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [food._id]: event.target.value }))} placeholder="Add a comment..." aria-label={`Comment on ${food.name}`} />
                    <button type="submit">Post</button>
                  </form>
                  {(food.comments || []).slice(-2).map((comment, index) => (
                    <small key={`${food._id}-${index}`}>{comment.text}</small>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Home
