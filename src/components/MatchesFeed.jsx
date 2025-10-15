export default function MatchesFeed({ matches, currentIndex, onAction, onViewProfile }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="screen matches-feed-screen">
        <div className="no-matches">
          <div className="no-matches-icon">🎯</div>
          <h2>No hay más matches por ahora</h2>
          <p>Vuelve más tarde para ver nuevas conexiones</p>
        </div>
      </div>
    )
  }

  const currentMatch = matches[currentIndex]
  if (!currentMatch) return null

  const getMatchTypeColor = (type) => {
    const colors = {
      affinity: '#10b981',
      complementary: '#3b82f6',
      serendipity: '#f59e0b',
      hybrid: '#8b5cf6'
    }
    return colors[type] || '#6b7280'
  }

  const getMatchTypeLabel = (type) => {
    const labels = {
      affinity: 'Afinidad',
      complementary: 'Complementario',
      serendipity: 'Serendipia',
      hybrid: 'Híbrido'
    }
    return labels[type] || type
  }

  const renderMatchReason = () => {
    const { match_type, match_reason } = currentMatch

    if (match_type === 'affinity') {
      return (
        <div className="match-reason">
          <p><strong>{match_reason.common_interests || 0}</strong> intereses en común</p>
          {match_reason.common_traits > 0 && (
            <p><strong>{match_reason.common_traits}</strong> rasgos de personalidad compartidos</p>
          )}
          <p>Compatibilidad de conversación: <strong>{match_reason.conversation_compatibility}</strong></p>
        </div>
      )
    }

    if (match_type === 'complementary') {
      return (
        <div className="match-reason">
          {match_reason.you_seek_they_offer > 0 && (
            <p>✅ Ofrece <strong>{match_reason.you_seek_they_offer}</strong> cosa(s) que buscas</p>
          )}
          {match_reason.they_seek_you_offer > 0 && (
            <p>✅ Busca <strong>{match_reason.they_seek_you_offer}</strong> cosa(s) que ofreces</p>
          )}
          {match_reason.bidirectional && (
            <p className="bidirectional-badge">🔄 Match bidireccional</p>
          )}
        </div>
      )
    }

    if (match_type === 'serendipity') {
      return (
        <div className="match-reason">
          <p>✨ Conexión inesperada</p>
          <p>Diversidad: <strong>{Math.round(match_reason.diversity_score || 0)}/20</strong></p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="screen matches-feed-screen">
      <div className="feed-header">
        <h2>Tus matches</h2>
        <p className="match-counter">{currentIndex + 1} / {matches.length}</p>
      </div>

      <div className="match-card">
        <div className="match-card-header">
          <div className="match-avatar">
            {currentMatch.user_avatar ? (
              <img src={currentMatch.user_avatar} alt={currentMatch.user_name} />
            ) : (
              <div className="avatar-placeholder">
                {currentMatch.user_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="match-info">
            <h3>{currentMatch.user_name}</h3>
            <span 
              className="match-type-badge"
              style={{ backgroundColor: getMatchTypeColor(currentMatch.match_type) }}
            >
              {getMatchTypeLabel(currentMatch.match_type)}
            </span>
          </div>

          <div className="match-score">
            <div className="score-circle">
              <span className="score-value">{Math.round(currentMatch.match_score)}</span>
              <span className="score-label">%</span>
            </div>
          </div>
        </div>

        <div className="match-card-body">
          {currentMatch.user_bio && (
            <div className="match-bio">
              <p>{currentMatch.user_bio}</p>
            </div>
          )}

          {renderMatchReason()}

          {/* Mostrar tags relevantes */}
          <div className="match-tags">
            {currentMatch.connection_mode === 'affinity' && currentMatch.interests && (
              <div className="tag-group">
                <h4>Intereses</h4>
                <div className="tags-list">
                  {JSON.parse(currentMatch.interests || '[]').slice(0, 5).map((interest, idx) => (
                    <span key={idx} className="tag">{interest}</span>
                  ))}
                </div>
              </div>
            )}

            {currentMatch.connection_mode === 'specific' && (
              <>
                {currentMatch.seeking && JSON.parse(currentMatch.seeking || '[]').length > 0 && (
                  <div className="tag-group">
                    <h4>Busca</h4>
                    <div className="tags-list">
                      {JSON.parse(currentMatch.seeking).map((item, idx) => (
                        <span key={idx} className="tag tag-seeking">{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                {currentMatch.offering && JSON.parse(currentMatch.offering || '[]').length > 0 && (
                  <div className="tag-group">
                    <h4>Ofrece</h4>
                    <div className="tags-list">
                      {JSON.parse(currentMatch.offering).map((item, idx) => (
                        <span key={idx} className="tag tag-offering">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
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
            onClick={() => onAction('passed')}
            title="Pasar"
          >
            ✕
          </button>
          
          <button 
            className="action-btn action-interested"
            onClick={() => onAction('interested')}
            title="Me interesa"
          >
            ⭐
          </button>
          
          <button 
            className="action-btn action-connect"
            onClick={() => onAction('connected')}
            title="Conectar"
          >
            🤝
          </button>
        </div>
      </div>
    </div>
  )
}
