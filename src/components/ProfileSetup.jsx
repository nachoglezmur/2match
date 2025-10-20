import { useState } from 'react'
import Spinner from './Spinner'

export default function ProfileSetup({ mode, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    role: '',
    email: '',
    phone: '',
    sharePhone: true,
    bio: '',
    goals: '',
    interests: [],
    offers: [],
    needs: []
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(false)

  const toggleTag = (field, tag) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(tag)
        ? prev[field].filter(t => t !== tag)
        : [...prev[field], tag]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    const sanitizeTags = (tags) => Array.from(new Set((tags || []).map(tag => tag.trim()).filter(Boolean)))

    onComplete({
      fullName: formData.fullName.trim(),
      company: formData.company.trim(),
      role: formData.role.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      sharePhone: formData.sharePhone,
      bio: formData.bio.trim(),
      goals: formData.goals.trim(),
      interests: sanitizeTags(formData.interests),
      offers: sanitizeTags(formData.offers),
      needs: sanitizeTags(formData.needs)
    }).finally(() => setLoading(false))
  }

  // CATEGORÍAS DE INTERESES CON MUCHOS MÁS TAGS
  const interestCategories = {
    'Tecnología': [
      'IA', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
      'Blockchain', 'Web3', 'Criptomonedas', 'NFTs', 'DeFi',
      'Cloud Computing', 'DevOps', 'Ciberseguridad', 'IoT', 'Big Data',
      'Data Science', 'Data Analytics', 'Business Intelligence',
      'Desarrollo Web', 'Desarrollo Mobile', 'Frontend', 'Backend', 'Full Stack',
      'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go',
      'APIs', 'Microservicios', 'Arquitectura de Software'
    ],
    'Negocios': [
      'Startups', 'Emprendimiento', 'Inversión', 'Venture Capital', 'Angel Investing',
      'Fundraising', 'Pitch Deck', 'Business Model', 'Lean Startup',
      'Product-Market Fit', 'Go-to-Market', 'Escalabilidad',
      'SaaS', 'B2B', 'B2C', 'Marketplace', 'E-commerce', 'Retail',
      'Fintech', 'Healthtech', 'Edtech', 'Proptech', 'Agritech',
      'Logística', 'Supply Chain', 'Operaciones', 'Procesos'
    ],
    'Marketing': [
      'Marketing Digital', 'Growth Hacking', 'SEO', 'SEM', 'Content Marketing',
      'Social Media', 'Community Management', 'Influencer Marketing',
      'Email Marketing', 'Marketing Automation', 'CRM Marketing', 'Lead Generation',
      'Conversion Rate Optimization', 'A/B Testing', 'Marketing Analytics',
      'Branding', 'Copywriting', 'Storytelling', 'PR', 'Comunicación',
      'Performance Marketing', 'Paid Ads', 'Facebook Ads', 'Google Ads'
    ],
    'Producto': [
      'Product Management', 'Product Design', 'UX', 'UI', 'UX Research',
      'User Testing', 'Wireframing', 'Prototyping', 'Design Thinking',
      'Figma', 'Sketch', 'Adobe XD', 'Design Systems',
      'Product Strategy', 'Roadmap', 'Priorización', 'Métricas de Producto',
      'Customer Development', 'Jobs to be Done', 'User Stories'
    ],
    'Ventas': [
      'Sales', 'Business Development', 'Account Management', 'Customer Success',
      'Prospección', 'Cold Calling', 'Cold Email', 'LinkedIn Sales',
      'Negociación', 'Closing', 'Pipeline Management', 'CRM Ventas',
      'Enterprise Sales', 'SMB Sales', 'Inside Sales', 'Field Sales',
      'Channel Sales', 'Partner Management', 'Ventas Retail'
    ],
    'Otros': [
      'Recursos Humanos', 'Talent Acquisition', 'Cultura Organizacional',
      'Legal', 'Compliance', 'Contratos', 'Propiedad Intelectual',
      'Finanzas', 'Contabilidad', 'Fiscal', 'Tesorería',
      'Sostenibilidad', 'ESG', 'Impacto Social', 'Economía Circular',
      'Educación', 'Formación', 'Coaching', 'Mentoría'
    ]
  }

  // BUSCANDO (más específico)
  const seekingCategories = {
    'Inversión': [
      'Inversor seed (50k-500k)', 'Inversor Serie A (1M-5M)', 'Business Angel',
      'Family Office', 'Venture Capital', 'Corporate Venture',
      'Crowdfunding', 'Grants', 'Subvenciones'
    ],
    'Cofundadores': [
      'Cofundador técnico (CTO)', 'Cofundador negocio (CEO)', 'Cofundador producto (CPO)',
      'Cofundador marketing (CMO)', 'Cofundador ventas', 'Cofundador operaciones (COO)'
    ],
    'Equipo': [
      'Desarrollador Full Stack', 'Desarrollador Frontend', 'Desarrollador Backend',
      'Desarrollador Mobile', 'DevOps Engineer', 'Data Scientist',
      'Diseñador UI/UX', 'Product Designer', 'Graphic Designer',
      'Product Manager', 'Project Manager', 'Scrum Master',
      'Marketing Manager', 'Growth Hacker', 'Community Manager',
      'Sales Manager', 'Business Developer', 'Customer Success'
    ],
    'Mentoría': [
      'Mentor en producto', 'Mentor en tecnología', 'Mentor en ventas',
      'Mentor en marketing', 'Mentor en fundraising', 'Mentor en operaciones',
      'Mentor en legal', 'Mentor en finanzas', 'Advisor estratégico'
    ],
    'Clientes/Partners': [
      'Primeros clientes', 'Beta testers', 'Early adopters',
      'Partner estratégico', 'Partner tecnológico', 'Partner comercial',
      'Distribuidor', 'Reseller', 'Integrador'
    ],
    'Otros': [
      'Freelancer', 'Consultor', 'Proveedor de servicios',
      'Contactos en industria específica', 'Introducción a inversores',
      'Introducción a clientes', 'Espacio de coworking', 'Aceleradora'
    ]
  }

  // OFRECIENDO (más específico)
  const offeringCategories = {
    'Capital': [
      'Capital seed (50k-500k)', 'Capital Serie A (1M+)', 'Inversión angel',
      'Préstamo', 'Equity', 'Convertible note', 'SAFE'
    ],
    'Experiencia': [
      'Experiencia técnica', 'Experiencia en producto', 'Experiencia en ventas',
      'Experiencia en marketing', 'Experiencia en operaciones',
      'Experiencia en fundraising', 'Experiencia en scaling',
      'Experiencia en exits', 'Experiencia internacional'
    ],
    'Recursos': [
      'Red de contactos', 'Network de inversores', 'Network de clientes',
      'Mentoría', 'Coaching', 'Formación', 'Consultoría',
      'Espacio de oficina', 'Infraestructura', 'Herramientas'
    ],
    'Equipo/Producto': [
      'Equipo técnico completo', 'Equipo de desarrollo', 'Equipo de diseño',
      'Prototipo funcional', 'MVP validado', 'Producto en producción',
      'Tracción (usuarios)', 'Tracción (ingresos)', 'Clientes pagando'
    ],
    'Skills': [
      'Desarrollo Full Stack', 'Desarrollo Mobile', 'Diseño UI/UX',
      'Product Management', 'Marketing Digital', 'Growth Hacking',
      'Ventas B2B', 'Ventas B2C', 'Business Development',
      'Data Science', 'Machine Learning', 'DevOps'
    ],
    'Conocimiento': [
      'Conocimiento del mercado', 'Conocimiento de la industria',
      'Conocimiento técnico', 'Conocimiento regulatorio',
      'Conocimiento de competidores', 'Tendencias del sector'
    ]
  }

  // Función para filtrar tags por búsqueda y categoría
  const filterTags = (categories) => {
    let allTags = []
    
    if (activeCategory === 'all') {
      Object.values(categories).flat().forEach(tag => allTags.push(tag))
    } else {
      allTags = categories[activeCategory] || []
    }

    if (searchTerm.trim()) {
      return allTags.filter(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return allTags
  }

  // Componente reutilizable para selector con búsqueda
  const TagSelectorWithSearch = ({ field, categories, colorClass = '' }) => {
    const [localSearch, setLocalSearch] = useState('')
    const [localCategory, setLocalCategory] = useState('all')
    
    const categoryNames = Object.keys(categories)
    const filteredTags = localSearch.trim()
      ? (localCategory === 'all' 
          ? Object.values(categories).flat()
          : categories[localCategory] || []
        ).filter(tag => tag.toLowerCase().includes(localSearch.toLowerCase()))
      : (localCategory === 'all'
          ? Object.values(categories).flat()
          : categories[localCategory] || [])
    
    return (
      <div className="tag-selector-with-search">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Buscar..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-tabs">
          <button
            type="button"
            className={`category-tab ${localCategory === 'all' ? 'active' : ''}`}
            onClick={() => setLocalCategory('all')}
          >
            Todas
          </button>
          {categoryNames.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-tab ${localCategory === cat ? 'active' : ''}`}
              onClick={() => setLocalCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="tag-selector-scrollable">
          {filteredTags.length > 0 ? (
            filteredTags.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-option ${colorClass} ${formData[field].includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(field, tag)}
              >
                {tag}
              </button>
            ))
          ) : (
            <p className="no-results">No se encontraron resultados</p>
          )}
        </div>
        
        {formData[field].length > 0 && (
          <div className="selected-tags">
            <p className="selected-count">✓ Seleccionados: {formData[field].length}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="screen profile-setup-screen">
      <button className="btn-back" onClick={onBack}>← Volver</button>
      
      <div className="screen-header">
        <h2>Completa tu perfil</h2>
        <p>Información relevante para conectar mejor</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Información básica */}
        <div className="form-section">
          <h3>📋 Información básica</h3>
          
          <div className="form-group">
            <label>Tu nombre *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Laura Martín"
              required
            />
          </div>

          <div className="form-group">
            <label>Empresa / Proyecto</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              placeholder="Nombre de tu organización"
            />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              placeholder="Ej: Head of Sales"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+34 600 000 000"
            />
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.sharePhone}
                  onChange={(e) => setFormData({...formData, sharePhone: e.target.checked})}
                />
                <span>Compartir mi teléfono cuando haya match mutuo</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Sobre ti *</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Cuéntanos brevemente quién eres y a qué te dedicas..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Objetivo en este evento *</label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
              placeholder="¿Qué tipo de conexiones te ayudarían hoy?"
              rows="3"
              required
            />
          </div>
        </div>

        {/* Modo Affinity */}
        {mode === 'affinity' && (
          <>
            <div className="form-section">
              <h3>🎯 Tus intereses</h3>
              <p className="form-hint">Busca y selecciona los temas que te apasionen</p>
              <TagSelectorWithSearch field="interests" categories={interestCategories} />
            </div>

          </>
        )}

        {/* Modo Specific */}
        {mode === 'specific' && (
          <>
            <div className="form-section">
              <h3>🔍 ¿Qué buscas?</h3>
              <p className="form-hint">Busca y selecciona lo que necesitas</p>
              <TagSelectorWithSearch field="needs" categories={seekingCategories} colorClass="tag-seeking-option" />
            </div>

            <div className="form-section">
              <h3>💎 ¿Qué ofreces?</h3>
              <p className="form-hint">Busca y selecciona lo que puedes aportar</p>
              <TagSelectorWithSearch field="offers" categories={offeringCategories} colorClass="tag-offering-option" />
            </div>
          </>
        )}

        {/* Modo Explore */}
        {mode === 'explore' && (
          <>
            <div className="form-section">
              <h3>🧭 Áreas de interés (opcional)</h3>
              <p className="form-hint">Selecciona 2-3 categorías generales</p>
              <TagSelectorWithSearch field="interests" categories={interestCategories} colorClass="tag-broad-option" />
            </div>
          </>
        )}

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Spinner className="mr-2" />
              Guardando...
            </span>
          ) : 'Guardar perfil'}
        </button>
      </form>
    </div>
  )
}
