const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://backend-7g2c.onrender.com/api').replace(/\/$/, '');

export const saveParticipant = async (participantData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...participantData,
        event_id: '00000000-0000-0000-0000-000000000001',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Error al guardar el perfil');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/me/matches`);
    
    if (!response.ok) {
      throw new Error('Error al obtener los matches');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const recordMatchDecision = async (targetId, action) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: '00000000-0000-0000-0000-000000000001',
        target_id: targetId,
        action: action,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Error al registrar la decisión');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getConfirmedMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/me/confirmed_matches`);
    
    if (!response.ok) {
      throw new Error('Error al obtener los matches confirmados');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const searchParticipants = async (term, excludeId) => {
  try {
    const params = new URLSearchParams();
    if (term) params.append('term', term);
    if (excludeId) params.append('exclude_id', excludeId);
    
    const response = await fetch(
      `${API_BASE_URL}/events/00000000-0000-0000-0000-000000000001/search?${params}`
    );
    
    if (!response.ok) {
      throw new Error('Error al buscar participantes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/me`);
    
    if (!response.ok) {
      return { logged_in: false };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return { logged_in: false };
  }
};
