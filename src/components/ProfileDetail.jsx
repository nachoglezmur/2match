export default function ProfileDetail({ match, onBack, onAction }) {
  if (!match) return null

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

  return (
    <div className="screen profile-detail-screen">
      <button className="btn-back" onClick={onBack}>← Volver</button>

      <div className="profile-detail-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {match.user_avatar ? (
              <img src={match.user_avatar} alt={match.user_name} />
            ) : (
              <div className="avatar-placeholder-large">
                {match.user_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2>{match.user_name}</h2>
          
          <div className="profile-match-info">
            <div className="match-score-large">
              <span className="score-value">{Math.round(match.match_score)}</span>
              <span className="score-label">% compatible</span>
            </div>
            
            <span 
              className="match-type-badge-large"
              style={{ backgroundColor: getMatchTypeColor(match.match_type) }}
            >
              {getMatchTypeLabel(match.match_type)}
            </span>
          </div>
        </div>

        <div className="profile-content">
          {match.user_bio && (
            <div className="profile-section">
              <h3>📝 Sobre {match.user_name.split(' ')[0]}</h3>
              <p>{match.user_bio}</p>
            </div>
          )}

          {/* Por qué matchearon */}
          <div className="profile-section">
            <h3>✨ Por qué matchearon</h3>
            {match.match_type === 'affinity' && match.match_reason && (
              <div className="match-explanation">
                <div className="explanation-item">
                  <span className="explanation-icon">🎯</span>
                  <div>
                    <strong>Intereses comunes</strong>
                    <p>{match.match_reason.common_interests || 0} intereses compartidos</p>
                  </div>
                </div>
                
                {match.match_reason.common_traits > 0 && (
                  <div className="explanation-item">
                    <span className="explanation-icon">👤</span>
                    <div>
                      <strong>Personalidad similar</strong>
                      <p>{match.match_reason.common_traits} rasgos en común</p>
                    </div>
                  </div>
                )}
                
                <div className="explanation-item">
                  <span className="explanation-icon">💬</span>
                  <div>
                    <strong>Estilo de conversación</strong>
                    <p>Compatibilidad {match.match_reason.conversation_compatibility}</p>
                  </div>
                </div>
              </div>
            )}

            {match.match_type === 'complementary' && match.match_reason && (
              <div className="match-explanation">
                {match.match_reason.you_seek_they_offer > 0 && (
                  <div className="explanation-item">
                    <span className="explanation-icon">✅</span>
                    <div>
                      <strong>Ofrece lo que buscas</strong>
                      <p>{match.match_reason.you_seek_they_offer} coincidencia(s)</p>
                    </div>
                  </div>
                )}
                
                {match.match_reason.they_seek_you_offer > 0 && (
                  <div className="explanation-item">
                    <span className="explanation-icon">💎</span>
                    <div>
                      <strong>Busca lo que ofreces</strong>
                      <p>{match.match_reason.they_seek_you_offer} coincidencia(s)</p>
                    </div>
                  </div>
                )}
                
                {match.match_reason.bidirectional && (
                  <div className="explanation-item highlight">
                    <span className="explanation-icon">🔄</span>
                    <div>
                      <strong>Match bidireccional</strong>
                      <p>Ambos pueden ayudarse mutuamente</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {match.match_type === 'serendipity' && (
              <div className="match-explanation">
                <div className="explanation-item">
                  <span className="explanation-icon">✨</span>
                  <div>
                    <strong>Conexión inesperada</strong>
                    <p>Perfiles diversos que pueden generar ideas innovadoras</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detalles del perfil */}
          {match.connection_mode === 'affinity' && match.interests && (
            <div className="profile-section">
              <h3>🎯 Intereses</h3>
              <div className="tags-list">
                {JSON.parse(match.interests || '[]').map((interest, idx) => (
                  <span key={idx} className="tag tag-large">{interest}</span>
                ))}
              </div>
            </div>
          )}

          {match.connection_mode === 'affinity' && match.personality_traits && (
            <div className="profile-section">
              <h3>👤 Personalidad</h3>
              <div className="tags-list">
                {JSON.parse(match.personality_traits || '[]').map((trait, idx) => (
                  <span key={idx} className="tag tag-large">{trait}</span>
                ))}
              </div>
            </div>
          )}

          {match.connection_mode === 'specific' && (
            <>
              {match.seeking && JSON.parse(match.seeking || '[]').length > 0 && (
                <div className="profile-section">
                  <h3>🔍 Busca</h3>
                  <div className="tags-list">
                    {JSON.parse(match.seeking).map((item, idx) => (
                      <span key={idx} className="tag tag-seeking tag-large">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {match.offering && JSON.parse(match.offering || '[]').length > 0 && (
                <div className="profile-section">
                  <h3>💎 Ofrece</h3>
                  <div className="tags-list">
                    {JSON.parse(match.offering).map((item, idx) => (
                      <span key={idx} className="tag tag-offering tag-large">{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {match.connection_mode === 'explore' && match.broad_tags && (
            <div className="profile-section">
              <h3>🧭 Áreas de interés</h3>
              <div className="tags-list">
                {JSON.parse(match.broad_tags || '[]').map((tag, idx) => (
                  <span key={idx} className="tag tag-broad tag-large">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button 
            className="btn-secondary btn-large"
            onClick={() => onAction('passed')}
          >
            Pasar
          </button>
          
          <button 
            className="btn-primary btn-large"
            onClick={() => onAction('connected')}
          >
            🤝 Conectar
          </button>
        </div>
      </div>
    </div>
  )
}
