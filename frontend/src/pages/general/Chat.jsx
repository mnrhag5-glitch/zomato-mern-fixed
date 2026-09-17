import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
import { Link, useParams, useSearchParams } from 'react-router-dom'

function Chat() {
  const { partnerId } = useParams()
  const [searchParams] = useSearchParams()
  const partnerUserId = searchParams.get('userId')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [partnerName, setPartnerName] = useState('Chat')

  function formatMessageTime(timestamp) {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(timestamp))
  }

  async function loadMessages() {
    const query = partnerUserId ? `?userId=${partnerUserId}` : ''
    const response = await apiFetch(`/api/chat/partner/${partnerId}${query}`, { credentials: 'include' })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.message || 'Unable to load chat.')
    setMessages(result.messages)
  }

  useEffect(() => {
    loadMessages().catch((requestError) => setError(requestError.message))
    apiFetch(`/api/food/partner/${partnerId}`).then((response) => response.json()).then((result) => {
      if (result.foodPartner) setPartnerName(result.foodPartner.name)
    })
  }, [partnerId, partnerUserId])

  async function sendMessage(event) {
    event.preventDefault()
    if (!text.trim()) return
    const body = { text }
    if (partnerUserId) body.userId = partnerUserId
    const response = await apiFetch(`/api/chat/partner/${partnerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) return setError(result.message || 'Unable to send message.')
    setMessages((current) => [...current, result.message])
    setText('')
  }

  async function messageAction(messageId, action) {
    const response = await apiFetch(`/api/chat/message/${messageId}${action === 'like' ? '/like' : ''}`, {
      method: action === 'like' ? 'PATCH' : 'DELETE',
      ...(action === 'like' ? {} : {}),
      credentials: 'include',
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) return setError(result.message || 'Unable to update message.')
    if (action === 'like') setMessages((current) => current.map((message) => message._id === messageId ? result.message : message))
    else setMessages((current) => current.filter((message) => message._id !== messageId))
  }

  return (
    <main className="chat-page">
      <header className="chat-header">
        <Link className="profile-brand" to="/">zomato</Link>
        <strong>{partnerName}</strong>
        <Link className="profile-back-link" to="/">Back</Link>
      </header>
      <section className="chat-window">
        {error && <p className="chat-error">{error}</p>}
        <div className="chat-messages">
          {messages.map((message) => (
            <article className={`chat-message ${message.senderRole === 'partner' ? 'is-partner' : 'is-user'}`} key={message._id}>
              <p>{message.text}</p>
              <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
              <div>
                <button type="button" onClick={() => messageAction(message._id, 'like')}>
                  {message.likedBy?.length ? '♥' : '♡'} Like
                </button>
                <button type="button" onClick={() => messageAction(message._id, 'delete')}>Delete</button>
              </div>
            </article>
          ))}
        </div>
        <form className="chat-composer" onSubmit={sendMessage}>
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message..." />
          <button type="submit">Send</button>
        </form>
      </section>
    </main>
  )
}

export default Chat
