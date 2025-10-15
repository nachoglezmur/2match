import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

export default function ChatWindow({ match, currentUser, onClose, onViewProfile }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  const otherUserName = match.user_name

  useEffect(() => {
    loadMessages()
    
    // Suscribirse a nuevos mensajes en tiempo real
    const channel = supabase
      .channel(`chat-${match.profile_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${match.match_id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        scrollToBottom()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [match.profile_id, match.match_id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      // Buscar el match_id
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .or(`profile1_id.eq.${currentUser.profile_id},profile2_id.eq.${currentUser.profile_id}`)
        .or(`profile1_id.eq.${match.profile_id},profile2_id.eq.${match.profile_id}`)
        .single()

      if (matchError) {
        console.error('Error finding match:', matchError)
        setLoading(false)
        return
      }

      const matchId = matchData.id

      // Cargar mensajes
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      // Buscar el match_id
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .or(`profile1_id.eq.${currentUser.profile_id},profile2_id.eq.${currentUser.profile_id}`)
        .or(`profile1_id.eq.${match.profile_id},profile2_id.eq.${match.profile_id}`)
        .single()

      if (matchError) throw matchError

      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchData.id,
          sender_id: currentUser.id,
          content: newMessage.trim()
        })

      if (error) throw error
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Error al enviar mensaje')
    }
  }

  return (
    <div className="screen chat-screen">
      <div className="chat-header">
        <button className="btn-back" onClick={onClose}>
          ← Volver
        </button>
        <div className="chat-header-info">
          <h3>{otherUserName}</h3>
          <span className="match-score-small">{Math.round(match.match_score)}% match</span>
        </div>
        <button className="btn-view-profile" onClick={() => onViewProfile(match)}>
          Ver perfil
        </button>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="loading">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>👋 ¡Empieza la conversación!</p>
            <p className="hint">Di hola y preséntate</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.sender_id === currentUser.id ? 'message-sent' : 'message-received'}`}
            >
              <div className="message-content">
                {msg.content}
              </div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          autoFocus
        />
        <button 
          type="submit" 
          className="btn-send"
          disabled={!newMessage.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
