import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'

function CreateFoodPartner() {
  const navigate = useNavigate()
  const formRef = useRef(null)
  const [form, setForm] = useState({ name: '', description: '', videoUrl: '' })
  const [videoFile, setVideoFile] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleFileChange(event) {
    setVideoFile(event.target.files[0] || null)
    setStatus({ type: '', message: '' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setIsSubmitting(true)

    const body = new FormData()
    body.append('name', form.name)
    body.append('description', form.description)
    if (videoFile) body.append('video', videoFile)
    if (form.videoUrl.trim()) body.append('videoUrl', form.videoUrl.trim())

    try {
      const response = await apiFetch('/api/food', {
        method: 'POST',
        credentials: 'include',
        body,
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to publish this reel.')
      }

      setForm({ name: '', description: '', videoUrl: '' })
      setVideoFile(null)
      formRef.current?.reset()
      navigate('/')
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="partner-dashboard">
      <header className="partner-dashboard-header">
        <Link className="profile-brand" to="/food-partner/home">zomato</Link>
        <Link className="profile-back-link" to="/food-partner/home">Partner home</Link>
      </header>
      <section className="partner-dashboard-content">
        <div className="partner-dashboard-intro">
          <p className="eyebrow">Create a reel</p>
          <h1>Share what makes your food special.</h1>
          <p>Upload a vertical food video and let hungry customers discover your restaurant.</p>
        </div>

        <form className="upload-card" onSubmit={handleSubmit} ref={formRef}>
          <div className="upload-card-heading">
            <div>
              <p className="eyebrow">Partner upload</p>
              <h2>Upload food video</h2>
            </div>
            <span className="upload-icon" aria-hidden="true">+</span>
          </div>
          <label className="upload-field">
            <span>Video name</span>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Creamy peri peri pasta" required />
          </label>
          <label className="upload-field">
            <span>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Tell customers what makes this dish special..." rows="4" maxLength="180" required />
          </label>
          <label className="video-file-picker">
            <span className="picker-icon" aria-hidden="true">↑</span>
            <strong>{videoFile ? videoFile.name : 'Choose a video from your device'}</strong>
            <small>MP4, MOV or WebM · Recommended vertical format</small>
            <input type="file" name="video" accept="video/*" onChange={handleFileChange} />
          </label>
          <div className="upload-divider"><span>or paste a video link</span></div>
          <label className="upload-field">
            <span>Video URL <em>(optional if file selected)</em></span>
            <input type="url" name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://example.com/your-food-video.mp4" />
          </label>
          <button className="primary-button upload-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish food reel'}
            <span aria-hidden="true">→</span>
          </button>
          {status.message && <p className={`upload-status ${status.type}`} role="alert">{status.message}</p>}
        </form>
      </section>
    </main>
  )
}

export default CreateFoodPartner
