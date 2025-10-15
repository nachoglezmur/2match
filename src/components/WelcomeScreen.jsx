export default function WelcomeScreen({ onStart }) {
  return (
    <div className="screen welcome-screen">
      <div className="welcome-content">
        <div className="logo-large">🤝</div>
        <h1 className="welcome-title">2match</h1>
        <p className="welcome-tagline">Conecta con las personas correctas en eventos</p>
        
        <div className="event-info">
          <h3>📍 Tech Networking Madrid 2025</h3>
          <p>Encuentra personas afines, perfiles específicos o descubre conexiones inesperadas</p>
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <p>Matching inteligente basado en tus objetivos</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <p>Configuración en menos de 1 minuto</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <p>100% gratis y privado</p>
          </div>
        </div>

        <button className="btn-primary btn-large" onClick={onStart}>
          Comenzar →
        </button>
      </div>
    </div>
  )
}
