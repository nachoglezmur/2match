export default function ModeSelection({ onSelectMode }) {
  const modes = [
    {
      id: 'affinity',
      icon: '🤝',
      title: 'Conocer gente afín',
      description: 'Conecta con personas que comparten tus intereses y valores',
      details: 'Te pediremos: tus intereses, tipo de personalidad y preferencias de conversación'
    },
    {
      id: 'specific',
      icon: '🎯',
      title: 'Busco perfiles específicos',
      description: 'Encuentra exactamente lo que buscas y ofrece lo que tienes',
      details: 'Te pediremos: qué buscas y qué puedes ofrecer'
    },
    {
      id: 'explore',
      icon: '🧭',
      title: 'Explorar y descubrir',
      description: 'Déjate sorprender con conexiones inesperadas',
      details: 'Solo necesitamos 2-3 tags amplios (opcional)'
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
