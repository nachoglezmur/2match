import { useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('register')
  const [formData, setFormData] = useState({
    contact: '',
    contactType: 'email',
    interests: '',
    lookingForSimilar: true,
    bio: '',
    characteristics: ''
  })
  const [validationData, setValidationData] = useState({
    name: '',
    email: '',
    attendedEvent: '',
    usedService: '',
    wouldPay: '',
    maxPrice: '',
    mainProblem: '',
    currentSolution: '',
    feedback: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [validationSubmitted, setValidationSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleValidationChange = (e) => {
    const { name, value } = e.target
    setValidationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.contact || !formData.interests || !formData.bio) {
      setError('Por favor completa todos los campos obligatorios')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('participants')
        .insert([
          {
            contact: formData.contact,
            contact_type: formData.contactType,
            interests: formData.interests,
            looking_for_similar: formData.lookingForSimilar,
            bio: formData.bio,
            characteristics: formData.characteristics
          }
        ])

      if (error) throw error

      setSubmitted(true)
      setFormData({
        contact: '',
        contactType: 'email',
        interests: '',
        lookingForSimilar: true,
        bio: '',
        characteristics: ''
      })
    } catch (err) {
      console.error('Error:', err)
      setError('Hubo un error al enviar el formulario. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleValidationSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validationData.name || !validationData.email) {
      setError('Por favor completa al menos tu nombre y email')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('validation_feedback')
        .insert([validationData])

      if (error) throw error

      setValidationSubmitted(true)
      setValidationData({
        name: '',
        email: '',
        attendedEvent: '',
        usedService: '',
        wouldPay: '',
        maxPrice: '',
        mainProblem: '',
        currentSolution: '',
        feedback: ''
      })
    } catch (err) {
      console.error('Error:', err)
      setError('Hubo un error al enviar el formulario. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="logo">🤝</div>
          <h1>2match</h1>
          <p className="tagline">Conecta con personas que comparten tus intereses</p>
          <p className="subtitle">Networking inteligente en eventos</p>
        </div>
      </header>

      <main className="main-content">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            📝 Registrarme
          </button>
          <button
            className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            💭 Dar Feedback
          </button>
        </div>

        {activeTab === 'register' && (
          <>
            {submitted && (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h2>¡Registro exitoso!</h2>
                <p>Te contactaremos pronto con personas que comparten tus intereses.</p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary">
                  Registrar otra persona
                </button>
              </div>
            )}

            {!submitted && (
              <form onSubmit={handleSubmit} className="form">
                <div className="form-section">
                  <h2><span className="section-icon">📋</span> Información de Contacto</h2>
                  
                  <div className="form-group">
                    <label htmlFor="contactType">Prefiero que me contacten por:</label>
                    <div className="radio-group">
                      <div className="radio-option">
                        <label className={`radio-label ${formData.contactType === 'email' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="contactType"
                            value="email"
                            checked={formData.contactType === 'email'}
                            onChange={handleChange}
                          />
                          <span>📧 Email</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <label className={`radio-label ${formData.contactType === 'phone' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="contactType"
                            value="phone"
                            checked={formData.contactType === 'phone'}
                            onChange={handleChange}
                          />
                          <span>📱 Teléfono</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact">
                      {formData.contactType === 'email' ? '📧 Tu Email *' : '📱 Tu Teléfono *'}
                    </label>
                    <input
                      type={formData.contactType === 'email' ? 'email' : 'tel'}
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder={formData.contactType === 'email' ? 'tu@email.com' : '+34 600 000 000'}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2><span className="section-icon">🎯</span> Tus Intereses</h2>
                  
                  <div className="form-group">
                    <label htmlFor="interests">
                      ¿Qué temas te interesan específicamente? *
                    </label>
                    <textarea
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      placeholder="Ejemplo: Desarrollo de apps con IA, marketing de contenidos para B2B, inversión en startups tecnológicas..."
                      className="input textarea"
                      rows="4"
                      required
                    />
                    <small className="hint">💡 Sé muy específico. Cuanto más detallado, mejores conexiones haremos.</small>
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="lookingForSimilar"
                        checked={formData.lookingForSimilar}
                        onChange={handleChange}
                      />
                      <span>Quiero conocer personas con intereses similares a los míos</span>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h2><span className="section-icon">👤</span> Sobre Ti</h2>
                  
                  <div className="form-group">
                    <label htmlFor="bio">
                      Cuéntanos sobre ti y tu experiencia *
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Ejemplo: Soy desarrollador full-stack con 5 años de experiencia. Actualmente trabajo en una startup de fintech y me apasiona la IA generativa..."
                      className="input textarea"
                      rows="4"
                      required
                    />
                    <small className="hint">💡 ¿Qué haces? ¿En qué trabajas? ¿Qué te apasiona?</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="characteristics">
                      ¿Qué tipo de personas te gustaría conocer?
                    </label>
                    <textarea
                      id="characteristics"
                      name="characteristics"
                      value={formData.characteristics}
                      onChange={handleChange}
                      placeholder="Ejemplo: Emprendedores que estén validando ideas, inversores ángeles interesados en tech, CTOs de startups en crecimiento..."
                      className="input textarea"
                      rows="3"
                    />
                    <small className="hint">💡 Opcional pero recomendado: Describe el perfil ideal de personas para conectar</small>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Enviando...' : '🚀 Conectar con personas afines'}
                </button>
              </form>
            )}
          </>
        )}

        {activeTab === 'validation' && (
          <>
            {validationSubmitted && (
              <div className="success-message">
                <div className="success-icon">🙏</div>
                <h2>¡Gracias por tu feedback!</h2>
                <p>Tu opinión es muy valiosa para mejorar 2match.</p>
                <button onClick={() => setValidationSubmitted(false)} className="btn-secondary">
                  Enviar más feedback
                </button>
              </div>
            )}

            {!validationSubmitted && (
              <form onSubmit={handleValidationSubmit} className="form">
                <div className="form-section">
                  <h2><span className="section-icon">👋</span> Información Básica</h2>
                  
                  <div className="form-group">
                    <label htmlFor="name">Tu nombre *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={validationData.name}
                      onChange={handleValidationChange}
                      placeholder="Juan Pérez"
                      className="input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Tu email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={validationData.email}
                      onChange={handleValidationChange}
                      placeholder="tu@email.com"
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2><span className="section-icon">🎪</span> Tu Experiencia en Eventos</h2>
                  
                  <div className="form-group">
                    <label htmlFor="attendedEvent">
                      ¿A cuántos eventos de networking has asistido en los últimos 6 meses?
                    </label>
                    <div className="radio-group">
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.attendedEvent === '0' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="attendedEvent"
                            value="0"
                            checked={validationData.attendedEvent === '0'}
                            onChange={handleValidationChange}
                          />
                          <span>Ninguno</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.attendedEvent === '1-3' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="attendedEvent"
                            value="1-3"
                            checked={validationData.attendedEvent === '1-3'}
                            onChange={handleValidationChange}
                          />
                          <span>1-3 eventos</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.attendedEvent === '4+' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="attendedEvent"
                            value="4+"
                            checked={validationData.attendedEvent === '4+'}
                            onChange={handleValidationChange}
                          />
                          <span>4 o más</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mainProblem">
                      ¿Cuál es tu mayor dificultad al asistir a eventos de networking?
                    </label>
                    <textarea
                      id="mainProblem"
                      name="mainProblem"
                      value={validationData.mainProblem}
                      onChange={handleValidationChange}
                      placeholder="Ejemplo: No sé con quién hablar, pierdo mucho tiempo con personas que no comparten mis intereses..."
                      className="input textarea"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="currentSolution">
                      ¿Cómo resuelves actualmente este problema?
                    </label>
                    <textarea
                      id="currentSolution"
                      name="currentSolution"
                      value={validationData.currentSolution}
                      onChange={handleValidationChange}
                      placeholder="Ejemplo: Pregunto al organizador, busco en LinkedIn antes del evento, hablo con todo el mundo..."
                      className="input textarea"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2><span className="section-icon">💰</span> Sobre el Servicio</h2>
                  
                  <div className="form-group">
                    <label htmlFor="usedService">
                      Si hubiera existido 2match en tu último evento, ¿lo habrías usado?
                    </label>
                    <div className="radio-group">
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.usedService === 'yes' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="usedService"
                            value="yes"
                            checked={validationData.usedService === 'yes'}
                            onChange={handleValidationChange}
                          />
                          <span>Sí, seguro</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.usedService === 'maybe' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="usedService"
                            value="maybe"
                            checked={validationData.usedService === 'maybe'}
                            onChange={handleValidationChange}
                          />
                          <span>Quizás</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.usedService === 'no' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="usedService"
                            value="no"
                            checked={validationData.usedService === 'no'}
                            onChange={handleValidationChange}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="wouldPay">
                      ¿Pagarías por un servicio que te conecte con las personas correctas en eventos?
                    </label>
                    <div className="radio-group">
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.wouldPay === 'yes' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="wouldPay"
                            value="yes"
                            checked={validationData.wouldPay === 'yes'}
                            onChange={handleValidationChange}
                          />
                          <span>Sí</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.wouldPay === 'maybe' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="wouldPay"
                            value="maybe"
                            checked={validationData.wouldPay === 'maybe'}
                            onChange={handleValidationChange}
                          />
                          <span>Depende</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <label className={`radio-label ${validationData.wouldPay === 'no' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="wouldPay"
                            value="no"
                            checked={validationData.wouldPay === 'no'}
                            onChange={handleValidationChange}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {validationData.wouldPay !== 'no' && (
                    <div className="form-group">
                      <label htmlFor="maxPrice">
                        ¿Cuánto estarías dispuesto a pagar por evento?
                      </label>
                      <input
                        type="text"
                        id="maxPrice"
                        name="maxPrice"
                        value={validationData.maxPrice}
                        onChange={handleValidationChange}
                        placeholder="Ejemplo: 5€, 10€, 20€..."
                        className="input"
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h2><span className="section-icon">💬</span> Feedback Adicional</h2>
                  
                  <div className="form-group">
                    <label htmlFor="feedback">
                      ¿Algo más que quieras compartir sobre tu experiencia o sugerencias?
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      value={validationData.feedback}
                      onChange={handleValidationChange}
                      placeholder="Cualquier comentario, sugerencia o idea es bienvenida..."
                      className="input textarea"
                      rows="4"
                    />
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Enviando...' : '📤 Enviar Feedback'}
                </button>
              </form>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>2match · Networking inteligente en eventos · Validación de concepto</p>
      </footer>
    </div>
  )
}

export default App
