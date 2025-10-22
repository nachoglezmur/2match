export default function ModeSelection({ onSelectMode }) {
  const modes = [
    {
      id: 'affinity',
      icon: '🤝',
      title: 'CONOCER GENTE AFÍN',
      description: 'Conecta con personas que comparten tus intereses y valores',
      details: 'Selecciona tus áreas de interés: Tech, Business, Marketing, Arte, Ciencia, etc.'
    },
    {
      id: 'specific',
      icon: '🎯',
      title: 'BUSCO PERFIL ESPECÍFICO',
      description: 'Encuentra exactamente lo que buscas y ofrece lo que tienes',
      details: 'Define qué buscas y qué ofreces: perfiles profesionales y habilidades específicas'
    },
    {
      id: 'explore',
      icon: '🧭',
      title: 'PERFIL DIVERSO',
      description: 'Déjate sorprender con conexiones inesperadas',
      details: 'Explora conexiones diversas basadas en intereses amplios'
    }
  ]

  return (
    <div className="screen mode-selection-screen">
      <div className="screen-header">
        <h2>¿Qué buscas en este evento?</h2>
        <p>Elige el modo que mejor se adapte a tu objetivo</p>
      </div>

      <div className="mode-cards">
        {modes.map(mode => (
          <div 
            key={mode.id}
            className="mode-card"
            onClick={() => onSelectMode(mode.id)}
          >
            <div className="mode-icon">{mode.icon}</div>
            <h3>{mode.title}</h3>
            <p className="mode-description">{mode.description}</p>
            <p className="mode-details">{mode.details}</p>
            <button className="btn-secondary">Seleccionar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
