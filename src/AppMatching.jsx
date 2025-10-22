import { useState, useRef, useEffect } from 'react'
import * as api from './api'
import ModeSelection from './components/ModeSelection'
import ProfileSetup from './components/ProfileSetup'
import MatchesFeed from './components/MatchesFeed'
import ProfileDetail from './components/ProfileDetail'
import './AppMatching.css'
import logo from '../logo.png'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const EVENT_ID = '00000000-0000-0000-0000-000000000001'

function AppMatching() {
  const [currentScreen, setCurrentScreen] = useState('modeSelection')
  const [selectedMode, setSelectedMode] = useState(null)
  const [participant, setParticipant] = useState(null)
  const [matches, setMatches] = useState([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [confirmedMatches, setConfirmedMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contactInfo, setContactInfo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)
  const dismissedPeersRef = useRef(new Set())
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe();
        if (data.logged_in) {
          setUser(data.user_info);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const normalizeText = (value) => {
    return (value ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const levenshtein = (a, b) => {
    if (a === b) return 0
    if (!a.length) return b.length
    if (!b.length) return a.length

    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }

    return matrix[a.length][b.length]
  }

  const fuzzyMatch = (text, normalizedTerm) => {
    if (!normalizedTerm) return false
    const normalizedText = normalizeText(
      typeof text === 'string' && text.startsWith('__auto:')
        ? text.substring('__auto:'.length)
        : text
    )
    if (!normalizedText) return false
    if (normalizedText.includes(normalizedTerm)) return true

    const tokens = normalizedText.split(' ').filter(Boolean)
    return tokens.some(token => {
      if (token.includes(normalizedTerm) || normalizedTerm.includes(token)) {
        return true
      }

      if (Math.abs(token.length - normalizedTerm.length) > 2) {
        return false
      }

      if (token.length < 3 || normalizedTerm.length < 3) {
        return false
      }

      return levenshtein(token, normalizedTerm) <= 1
    })
  }

  const generateTagVariants = (tags = []) => {
    const result = new Set()

    tags.forEach(tag => {
      const original = (tag || '').trim()
      if (!original) return
      result.add(original)

      const normalized = normalizeText(original)
      if (normalized) {
        result.add(`__auto:${normalized}`)

        const words = normalized.split(' ').filter(Boolean)
        words.forEach(word => {
          if (word.length >= 4) {
            result.add(`__auto:${word}`)
          }
        })

        for (let i = 0; i < words.length - 1; i++) {
          const bigram = `${words[i]} ${words[i + 1]}`.trim()
          if (bigram.length >= 6) {
            result.add(`__auto:${bigram}`)
          }
        }
      }
    })

    return Array.from(result)
  }

  const filterDisplayTags = (tags = []) => {
    return tags.filter(tag => typeof tag === 'string' && !tag.startsWith('__auto:'))
  }

  const handleSelectMode = (mode) => {
    setSelectedMode(mode)
    setCurrentScreen('profileSetup')
  }

  const handleProfileComplete = async (profileData) => {
    try {
      setLoading(true)
      setError('')

      const payload = {
        id: participant?.id,
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        company: profileData.company,
        role: profileData.role,
        bio: profileData.bio,
        goals: profileData.goals,
        share_phone: profileData.sharePhone ?? true,
        interests: profileData.interests ?? [],
        offers: profileData.offers ?? [],
        needs: profileData.needs ?? [],
      }

      const savedProfile = await api.saveParticipant(payload)

      setParticipant(savedProfile)
      
      toast.success('¡Perfil guardado correctamente!')
      
      await loadMatches()
      setCurrentScreen('feed')
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Error al guardar el perfil')
      toast.error(err.message || 'Error al guardar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError('')

      const matchesData = await api.getMatches()

      const filteredData = matchesData
        .filter(match => !dismissedPeersRef.current.has(match.peer_id))

      setMatches(filteredData)
      setCurrentMatchIndex(0)

      await loadConfirmedMatches()
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Error al cargar los matches. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const loadConfirmedMatches = async () => {
    try {
      const data = await api.getConfirmedMatches()
      setConfirmedMatches(data || [])
    } catch (err) {
      console.error('Error loading confirmed matches:', err)
    }
  }

  const removeMatchById = (peerId) => {
    if (peerId) {
      dismissedPeersRef.current.add(peerId)
    }

    setMatches(prev => {
      const filtered = prev.filter(match => match.peer_id !== peerId)
      setCurrentMatchIndex(prevIndex => (prevIndex >= filtered.length ? 0 : prevIndex))
      return filtered
    })

    setSelectedMatch(null)
  }

  const removeSearchResultById = (peerId) => {
    setSearchResults(prev => prev.filter(result => result.peer_id !== peerId))
  }

  const handleMatchDecision = async (action, targetMatch = null) => {
    const match = targetMatch || matches[currentMatchIndex]
    if (!match || !participant) return

    try {
      setLoading(true)
      setError('')

      const result = await api.recordMatchDecision(match.peer_id, action)

      if (result?.contact) {
        setContactInfo({ ...result.contact, isMutual: !!result.is_mutual })
      }

      removeMatchById(match.peer_id)
      removeSearchResultById(match.peer_id)

      dismissedPeersRef.current.add(match.peer_id)

      await loadConfirmedMatches()
    } catch (err) {
      console.error('Error processing match decision:', err)
      setError('Error al procesar la decisión. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = (match) => {
    setSelectedMatch(match)
    setCurrentScreen('profileDetail')
  }

  const handleBackFromDetail = () => {
    setSelectedMatch(null)
    setCurrentScreen('feed')
  }

  const handleBackFromSetup = () => {
    setCurrentScreen('modeSelection')
  }

  const handleOpenSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setSearchError('')
    setSearchPerformed(false)
    setSelectedMatch(null)
    setCurrentScreen('search')
  }

  const handleBackFromSearch = () => {
    setCurrentScreen('feed')
  }

  const mapParticipantToMatch = (record) => {
    const normalized = {
      peer_id: record.id,
      peer_name: record.full_name,
      peer_company: record.company,
      peer_role: record.role,
      peer_bio: record.bio,
      peer_goals: record.goals,
      peer_interests: record.interests || [],
      peer_offers: record.offers || [],
      peer_needs: record.needs || []
    }
    return normalized
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSearchError('')
      setSearchPerformed(false)
      return
    }

    try {
      setSearchLoading(true)
      setSearchError('')
      setSearchPerformed(true)

      const results = await api.searchParticipants(searchTerm, participant?.id)

      const confirmedMatchIds = new Set(confirmedMatches.map(m => m.other_participant || m.peer_id || m.id))
      const filteredResults = results
        .filter(profile => 
          !dismissedPeersRef.current.has(profile.id) && 
          !confirmedMatchIds.has(profile.id)
        )
        .map(profile => ({
          ...profile,
          peer_id: profile.id,
          peer_name: profile.full_name,
          peer_company: profile.company,
          peer_role: profile.role,
          peer_bio: profile.bio,
          peer_goals: profile.goals,
          peer_interests: profile.interests || [],
          peer_offers: profile.offers || [],
          peer_needs: profile.needs || []
        }))

      setSearchResults(filteredResults)
    } catch (err) {
      console.error('Error searching:', err)
      setSearchError('Error al realizar la búsqueda. Por favor, inténtalo de nuevo.')
      setSearchResults([])
      setSearchError('No se pudo realizar la búsqueda. Inténtalo de nuevo.')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectSearchResult = (match) => {
    setSelectedMatch(match)
    setCurrentScreen('profileDetail')
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-banner">
          <img src={logo} alt="2Match" className="logo-image" />
        </div>
        <div className="user-info">
          {user ? (
            <>
              <img src={user.picture} alt={user.name} className="user-picture" />
              <span className="user-name">{user.name}</span>
              <a href="https://backend-7g2c.onrender.com/api/logout" className="btn-logout">
                <span>🚪</span> Cerrar sesión
              </a>
            </>
          ) : (
            <a href="https://backend-7g2c.onrender.com/api/login/google" className="btn-login">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Iniciar sesión con Google
            </a>
          )}
        </div>
      </header>

      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar theme="dark" />
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      )}

      {error && (
        <div className="error-toast">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {user ? (
        <>
          {currentScreen === 'modeSelection' && (
            <div className="screen mode-selection-wrapper">
              <div className="logo-banner">
                <img src={logo} alt="2Match" className="logo-image" />
                <p>Conecta con la persona adecuada en segundos.</p>
              </div>
              <ModeSelection onSelectMode={handleSelectMode} />
            </div>
          )}

          {currentScreen === 'profileSetup' && (
            <ProfileSetup 
              mode={selectedMode}
              onComplete={handleProfileComplete}
              onBack={handleBackFromSetup}
            />
          )}

          {currentScreen === 'feed' && (
            <MatchesFeed
              matches={matches}
              currentIndex={currentMatchIndex}
              onMatch={(match) => handleMatchDecision('match', match)}
              onSkip={(match) => handleMatchDecision('skip', match)}
              onViewProfile={handleViewProfile}
              onOpenSearch={handleOpenSearch}
              confirmedMatches={confirmedMatches}
            />
          )}

          {currentScreen === 'search' && (
            <div className="screen matches-feed-screen">
              <button className="btn-back" onClick={handleBackFromSearch}>← Volver</button>

              <div className="feed-header">
                <h2>Buscar personas</h2>
                <p className="match-counter">Encuentra perfiles por nombre, bio o intereses.</p>
              </div>

              <form onSubmit={handleSearch} className="form">
                <div className="form-group">
                  <label htmlFor="searchTerm">Término de búsqueda</label>
                  <input
                    id="searchTerm"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ej: marketing, diseñador, Laura"
                    className="input"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={searchLoading}>
                  {searchLoading ? 'Buscando...' : 'Buscar'}
                </button>
              </form>

              {searchError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {searchError}
                </div>
              )}

              {!searchLoading && searchPerformed && searchResults.length === 0 && !searchError && (
                <div className="no-matches">
                  <div className="no-matches-icon">🔍</div>
                  <h2>Sin resultados</h2>
                  <p>No encontramos perfiles que coincidan con tu búsqueda.</p>
                </div>
              )}

              <div className="match-list">
                {searchResults.map(result => (
                  <div key={result.peer_id} className="match-card search-result-card">
                    <div className="match-card-header">
                      <div className="match-avatar">
                        <div className="avatar-placeholder">
                          {result.peer_name?.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="match-info">
                        <h3>{result.peer_name}</h3>
                        {(result.peer_role || result.peer_company) && (
                          <p className="match-company">{[result.peer_role, result.peer_company].filter(Boolean).join(' · ')}</p>
                        )}
                      </div>
                    </div>

                    <div className="match-card-body">
                      {(result.peer_bio || result.peer_goals) && (
                        <div className="match-bio">
                          {result.peer_bio && <p>{result.peer_bio}</p>}
                          {result.peer_goals && (
                            <p className="match-goals"><strong>Objetivo:</strong> {result.peer_goals}</p>
                          )}
                        </div>
                      )}

                      <div className="match-tags">
                        {result.peer_interests && result.peer_interests.length > 0 && (
                          <div className="tag-group">
                            <h4>Intereses</h4>
                            <div className="tags-list">
                              {result.peer_interests.slice(0, 6).map((interest, idx) => (
                                <span key={idx} className="tag">{interest}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.peer_needs && result.peer_needs.length > 0 && (
                          <div className="tag-group">
                            <h4>Busca</h4>
                            <div className="tags-list">
                              {result.peer_needs.slice(0, 6).map((need, idx) => (
                                <span key={idx} className="tag tag-seeking">{need}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.peer_offers && result.peer_offers.length > 0 && (
                          <div className="tag-group">
                            <h4>Ofrece</h4>
                            <div className="tags-list">
                              {result.peer_offers.slice(0, 6).map((offer, idx) => (
                                <span key={idx} className="tag tag-offering">{offer}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="search-result-actions">
                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => handleSelectSearchResult(result)}
                      >
                        Ver perfil
                      </button>
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => handleMatchDecision('match', result)}
                        disabled={loading}
                      >
                        Hacer match
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentScreen === 'profileDetail' && (
            <ProfileDetail
              match={selectedMatch}
              onBack={handleBackFromDetail}
              onMatch={(match) => {
                handleMatchDecision('match', match)
                handleBackFromDetail()
              }}
              onSkip={(match) => {
                handleMatchDecision('skip', match)
                handleBackFromDetail()
              }}
            />
          )}
        </>
      ) : (
        <div className="screen mode-selection-wrapper">
          <div className="logo-banner">
            <img src={logo} alt="2Match" className="logo-image" />
            <p>Conecta con la persona adecuada en segundos.</p>
          </div>
          <div className="welcome-message">
            <h2>👋 Bienvenido a 2Match</h2>
            <p className="welcome-subtitle">La plataforma profesional para conectar con las personas adecuadas</p>
            <div className="login-features">
              <div className="login-feature">
                <span className="feature-icon">✅</span>
                <span>Matching inteligente</span>
              </div>
              <div className="login-feature">
                <span className="feature-icon">🔒</span>
                <span>Seguro y privado</span>
              </div>
              <div className="login-feature">
                <span className="feature-icon">⚡</span>
                <span>Rápido y fácil</span>
              </div>
            </div>
            <a href="https://backend-7g2c.onrender.com/api/login/google" className="btn-login-large">
              <svg width="24" height="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Iniciar sesión con Google
            </a>
            <p className="login-disclaimer">Al iniciar sesión, aceptas nuestros términos y política de privacidad</p>
          </div>
        </div>
      )}

      {contactInfo && (
        <div className="contact-modal">
          <div className="contact-card">
            <div className="contact-icon">🤝</div>
            <h3>¡Match confirmado!</h3>
            <p>Ahora puedes contactar con <strong>{contactInfo.name}</strong>.</p>

            <div className="contact-details">
              {contactInfo.email && (
                <a href={`mailto:${contactInfo.email}`} className="contact-pill">
                  <span className="pill-icon">📧</span>
                  <span>{contactInfo.email}</span>
                </a>
              )}
              {contactInfo.phone && (
                <a 
                  href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`👋 Hola ${contactInfo.name}! Te he visto en 2Match y me gustaría conectar contigo.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-pill contact-whatsapp"
                >
                  <span className="pill-icon">💬</span>
                  <span>Enviar WhatsApp</span>
                </a>
              )}
            </div>

            <button className="btn-primary" onClick={() => setContactInfo(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppMatching
