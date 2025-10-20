export default function ProfileDetail({ match, onBack, onMatch, onSkip }) {
  if (!match) return null

  const reason = match.match_reason || {}
  const confirmedComplementarity = reason.complementarity || {}

  return (
    <div className="screen profile-detail-screen">
      <button className="btn-back" onClick={onBack}>← Volver</button>

      <div className="profile-detail-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            <div className="avatar-placeholder-large">
              {match.peer_name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <h2>{match.peer_name}</h2>

          <div className="profile-match-info">
            <div className="match-score-large">
              <span className="score-value">{Math.round(match.match_score || 0)}</span>
              <span className="score-label">% compatible</span>
            </div>
            {(match.peer_role || match.peer_company) && (
              <span className="match-type-badge-large">
                {[match.peer_role, match.peer_company].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </div>

        <div className="profile-content">
          {match.peer_bio && (
            <div className="profile-section">
              <h3>📝 Sobre {match.peer_name.split(' ')[0]}</h3>
              <p>{match.peer_bio}</p>
            </div>
          )}

          {/* Por qué matchearon */}
          <div className="profile-section">
            <h3>✨ Por qué matchearon</h3>
            {reason.common_interests > 0 && (
              <div className="match-explanation">
                <div className="explanation-item">
                  <span className="explanation-icon">🎯</span>
                  <div>
                    <strong>Intereses comunes</strong>
                    <p>{reason.common_interests} intereses compartidos</p>
                  </div>
                </div>
              </div>
            )}

            {(reason.you_need_they_offer > 0 || reason.they_need_you_offer > 0) && (
              <div className="match-explanation">
                {reason.you_need_they_offer > 0 && (
                  <div className="explanation-item">
                    <span className="explanation-icon">💡</span>
                    <div>
                      <strong>Ellos pueden ayudarte</strong>
                      <p>{reason.you_need_they_offer} necesidades cubiertas</p>
                    </div>
                  </div>
                )}
                {reason.they_need_you_offer > 0 && (
                  <div className="explanation-item">
                    <span className="explanation-icon">🤝</span>
                    <div>
                      <strong>Tú puedes ayudarles</strong>
                      <p>{reason.they_need_you_offer} coincidencia(s)</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {reason.goal_similarity && (
              <div className="match-explanation">
                <div className="explanation-item">
                  <span className="explanation-icon">🚀</span>
                  <div>
                    <strong>Objetivos alineados</strong>
                    <p>Similitud {Math.round((reason.goal_similarity || 0) * 100)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detalles del perfil */}
          {match.peer_interests && match.peer_interests.length > 0 && (
            <div className="profile-section">
              <h3>🎯 Intereses</h3>
              <div className="tags-list">
                {match.peer_interests.map((interest, idx) => (
                  <span key={idx} className="tag tag-large">{interest}</span>
                ))}
              </div>
            </div>
          )}

          {match.peer_needs && match.peer_needs.length > 0 && (
            <div className="profile-section">
              <h3>🔍 Busca</h3>
              <div className="tags-list">
                {match.peer_needs.map((item, idx) => (
                  <span key={idx} className="tag tag-seeking tag-large">{item}</span>
                ))}
              </div>
            </div>
          )}

          {match.peer_offers && match.peer_offers.length > 0 && (
            <div className="profile-section">
              <h3>💎 Ofrece</h3>
              <div className="tags-list">
                {match.peer_offers.map((item, idx) => (
                  <span key={idx} className="tag tag-offering tag-large">{item}</span>
                ))}
              </div>
            </div>
          )}

          {confirmedComplementarity.you_need_they_offer && confirmedComplementarity.you_need_they_offer.length > 0 && (
            <div className="profile-section">
              <h3>✅ Lo que te aportan</h3>
              <div className="tags-list">
                {confirmedComplementarity.you_need_they_offer.map((item, idx) => (
                  <span key={idx} className="tag tag-seeking tag-large">{item}</span>
                ))}
              </div>
            </div>
          )}

          {confirmedComplementarity.they_need_you_offer && confirmedComplementarity.they_need_you_offer.length > 0 && (
            <div className="profile-section">
              <h3>💡 Les aportas</h3>
              <div className="tags-list">
                {confirmedComplementarity.they_need_you_offer.map((item, idx) => (
                  <span key={idx} className="tag tag-offering tag-large">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button 
            className="btn-secondary btn-large"
            onClick={() => onSkip && onSkip(match)}
          >
            Pasar
          </button>
          
          <button 
            className="btn-primary btn-large"
            onClick={() => onMatch && onMatch(match)}
          >
            🤝 Conectar
          </button>
        </div>
      </div>
    </div>
  )
}
