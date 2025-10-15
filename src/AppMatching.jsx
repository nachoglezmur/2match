import { useState } from 'react'
import { supabase } from './supabaseClient'
import WelcomeScreen from './components/WelcomeScreen'
import ModeSelection from './components/ModeSelection'
import ProfileSetup from './components/ProfileSetup'
import MatchesFeed from './components/MatchesFeed'
import ProfileDetail from './components/ProfileDetail'
import './AppMatching.css'

const EVENT_ID = '00000000-0000-0000-0000-000000000001'

function AppMatching() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [currentUser, setCurrentUser] = useState(null)
  const [currentProfile, setCurrentProfile] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)
  const [matches, setMatches] = useState([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = () => {
    setCurrentScreen('modeSelection')
  }

  const handleSelectMode = (mode) => {
    setSelectedMode(mode)
    setCurrentScreen('profileSetup')
  }

  const handleProfileComplete = async (profileData) => {
    setLoading(true)
    setError('')

    try {
      // 1. Crear o actualizar usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (userError) throw userError
      setCurrentUser(userData)

      // 2. Crear perfil de evento
      const profilePayload = {
        user_id: userData.id,
        event_id: EVENT_ID,
        connection_mode: selectedMode,
        interests: JSON.stringify(profileData.interests || []),
        personality_traits: JSON.stringify(profileData.personalityTraits || []),
        seeking: JSON.stringify(profileData.seeking || []),
        offering: JSON.stringify(profileData.offering || []),
        broad_tags: JSON.stringify(profileData.broadTags || []),
        skills: JSON.stringify(profileData.skills || []),
        current_project: profileData.currentProject || null,
        has_active_project: profileData.hasActiveProject || false,
        commitment_level: profileData.commitmentLevel || 5,
        availability: JSON.stringify(profileData.availability || []),
        conversation_depth: profileData.conversationDepth || 5
      }

      const { data: eventProfileData, error: profileError } = await supabase
        .from('event_profiles')
        .upsert(profilePayload, {
          onConflict: 'user_id,event_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (profileError) throw profileError
      setCurrentProfile(eventProfileData)

      // 3. Obtener matches
      await loadMatches(eventProfileData.id)

      setCurrentScreen('feed')
    } catch (err) {
      console.error('Error:', err)
      setError('Error al crear el perfil. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async (profileId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_best_matches', {
          for_profile_id: profileId,
          limit_count: 20
        })

      if (error) throw error
      setMatches(data || [])
      setCurrentMatchIndex(0)
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Error al cargar matches')
    }
  }

  const handleMatchAction = async (action) => {
    if (!matches[currentMatchIndex]) return

    const currentMatch = matches[currentMatchIndex]

    try {
      // Crear o encontrar el match en la base de datos
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .or(`and(profile1_id.eq.${currentProfile.id},profile2_id.eq.${currentMatch.profile_id}),and(profile1_id.eq.${currentMatch.profile_id},profile2_id.eq.${currentProfile.id})`)
        .single()

      let matchId = matchData?.id

      if (!matchId) {
        // Crear el match si no existe
        const { data: newMatch, error: createError } = await supabase
          .from('matches')
          .insert({
            event_id: EVENT_ID,
            profile1_id: currentProfile.id,
            profile2_id: currentMatch.profile_id,
            score: currentMatch.match_score,
            match_type: currentMatch.match_type,
            reason: currentMatch.match_reason
          })
          .select()
          .single()

        if (createError) throw createError
        matchId = newMatch.id
      }

      // Registrar la interacción
      const { error: interactionError } = await supabase
        .from('match_interactions')
        .insert({
          match_id: matchId,
          user_id: currentUser.id,
          action: action
        })

      if (interactionError) throw interactionError

      // Mostrar mensaje de éxito si conectó
      if (action === 'connected') {
        alert(`¡Conectado con ${currentMatch.user_name}! 🎉`)
      }

      // Avanzar al siguiente match
      if (currentMatchIndex < matches.length - 1) {
        setCurrentMatchIndex(currentMatchIndex + 1)
      } else {
        setMatches([])
      }
    } catch (err) {
      console.error('Error recording action:', err)
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

  return (
    <div className="app-container">
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

      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} />
      )}

      {currentScreen === 'modeSelection' && (
        <ModeSelection onSelectMode={handleSelectMode} />
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
          onAction={handleMatchAction}
          onViewProfile={handleViewProfile}
        />
      )}

      {currentScreen === 'profileDetail' && (
        <ProfileDetail
          match={selectedMatch}
          onBack={handleBackFromDetail}
          onAction={(action) => {
            handleMatchAction(action)
            handleBackFromDetail()
          }}
        />
      )}
    </div>
  )
}

export default AppMatching
