export default function MatchesFeed({ matches, currentIndex, onMatch, onSkip, onViewProfile, onOpenSearch, confirmedMatches = [] }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="screen matches-feed-screen">
        <div className="no-matches">
          <div className="no-matches-icon">🎯</div>
          <h2>No hay más matches por ahora</h2>
          <p>Vuelve más tarde para ver nuevas conexiones</p>
        </div>

        {confirmedMatches.length > 0 && (
          <div className="confirmed-matches">
            <h3>Matches confirmados</h3>
            <ul>
              {confirmedMatches.map(match => (
                <li key={match.other_participant}>
                  <div className="confirmed-match-info">
                    <strong>{match.other_name}</strong>
                    {match.other_company && <span className="match-company-small"> · {match.other_company}</span>}
                  </div>
                  {match.other_phone && (
                    <a 
                      href={`https://wa.me/${match.other_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`👋 Hola ${match.other_name}! Te he visto en 2Match y me gustaría conectar contigo.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-small"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const currentMatch = matches[currentIndex]
  if (!currentMatch) return null

  const renderMatchReason = () => {
    const reason = currentMatch.match_reason || {}
    const reasons = []

    if (reason.common_interests > 0) {
      reasons.push(`${reason.common_interests} intereses en común`)
    }
    if (reason.you_need_they_offer > 0) {
      reasons.push(`Ofrece ${reason.you_need_they_offer} cosa(s) que necesitas`)
    }
    if (reason.they_need_you_offer > 0) {
      reasons.push(`Busca ${reason.they_need_you_offer} cosa(s) que puedes ofrecer`)
    }
    if (reason.goal_similarity) {
      const similarity = Math.round((reason.goal_similarity || 0) * 100)
      reasons.push(`Objetivos similares (${similarity}%)`)
    }

    if (reasons.length === 0) return null

    return (
      <div className="match-reason">
        {reasons.map((text, idx) => (
          <p key={idx}>✅ {text}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="screen matches-feed-screen">
      <div className="feed-header">
        <div>
          <h2>Tus matches</h2>
          <p className="match-counter">{currentIndex + 1} / {matches.length}</p>
        </div>
        {onOpenSearch && (
          <button className="btn-secondary" onClick={onOpenSearch}>
            🔍 Buscar personas
          </button>
        )}
      </div>

      {confirmedMatches.length > 0 && (
        <div className="confirmed-summary">
          <h3>Contactos confirmados</h3>
          <p>Tienes {confirmedMatches.length} match(es) mutuos. Consulta tus mensajes de contacto.</p>
        </div>
      )}

      <div className="match-card">
        <div className="match-card-header">
          <div className="match-avatar">
            <div className="avatar-placeholder">
              {currentMatch.peer_name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="match-info">
            <h3>{currentMatch.peer_name}</h3>
            {(currentMatch.peer_role || currentMatch.peer_company) && (
              <p className="match-company">{[currentMatch.peer_role, currentMatch.peer_company].filter(Boolean).join(' · ')}</p>
            )}
          </div>

          <div className="match-score">
            <div className="score-circle">
              <span className="score-value">{Math.round(currentMatch.match_score || 0)}</span>
              <span className="score-label">%</span>
            </div>
          </div>
        </div>

        <div className="match-card-body">
          {(currentMatch.peer_bio || currentMatch.peer_goals) && (
            <div className="match-bio">
              {currentMatch.peer_bio && <p>{currentMatch.peer_bio}</p>}
              {currentMatch.peer_goals && (
                <p className="match-goals"><strong>Objetivo:</strong> {currentMatch.peer_goals}</p>
              )}
            </div>
          )}

          {renderMatchReason()}

          <div className="match-tags">
            {currentMatch.peer_interests && currentMatch.peer_interests.length > 0 && (
              <div className="tag-group">
                <h4>Intereses</h4>
                <div className="tags-list">
                  {currentMatch.peer_interests.slice(0, 6).map((interest, idx) => (
                    <span key={idx} className="tag">{interest}</span>
                  ))}
                </div>
              </div>
            )}

            {currentMatch.peer_needs && currentMatch.peer_needs.length > 0 && (
              <div className="tag-group">
                <h4>Busca</h4>
                <div className="tags-list">
                  {currentMatch.peer_needs.slice(0, 6).map((need, idx) => (
                    <span key={idx} className="tag tag-seeking">{need}</span>
                  ))}
                </div>
              </div>
            )}

            {currentMatch.peer_offers && currentMatch.peer_offers.length > 0 && (
              <div className="tag-group">
                <h4>Ofrece</h4>
                <div className="tags-list">
                  {currentMatch.peer_offers.slice(0, 6).map((offer, idx) => (
                    <span key={idx} className="tag tag-offering">{offer}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            className="btn-view-full"
            onClick={() => onViewProfile(currentMatch)}
          >
            Ver perfil completo
          </button>
        </div>

        <div className="match-actions">
          <button 
            className="action-btn action-pass"
            onClick={() => onSkip && onSkip(currentMatch)}
            title="Pasar"
          >
            ✕
          </button>
          
          <button 
            className="action-btn action-connect"
            onClick={() => onMatch && onMatch(currentMatch)}
            title="Match"
          >
            🤝
          </button>
        </div>
      </div>
    </div>
  )
}
