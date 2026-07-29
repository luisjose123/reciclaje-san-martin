import { useState, useEffect } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Page = 'home' | 'dashboard' | 'schedule' | 'materials' | 'profile' | 'admin' | 'prices'
type Modal = 'none' | 'login' | 'register' | 'schedule-form' | 'success' | 'admin-login'

interface User {
  nombreCompleto: string
  dni: string
  celular: string
  correo: string
  direccion: string
  distrito: string
}

interface ScheduleItem {
  id: string
  material: string
  cantidad: string
  unidad: string
  direccion: string
  fecha: string
  hora: string
  estado: 'pendiente' | 'confirmado' | 'completado'
  usuarioDni?: string
  usuarioNombre?: string
  creadoEn?: string
}

// Admin credentials (hardcoded for demo)
const ADMINS = [
  { usuario: 'admin', password: 'reciruta2024', nombre: 'Administrador General', rol: 'Super Admin' },
  { usuario: 'municipio_smp', password: 'smp2024', nombre: 'Municipalidad SMP', rol: 'Municipio' },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const MATERIALES = [
  { id: 'metal', nombre: 'Metal / Chatarra', icono: '🔩', descripcion: 'Fierros, aluminio, cobre, zinc, tuberías, cables', color: '#8B7355', bg: '#FFF8F0' },
  { id: 'plasticos', nombre: 'Plásticos', icono: '♻️', descripcion: 'Botellas PET, envases, bolsas, tapas, mangueras', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'colchones', nombre: 'Colchones y Sommiers', icono: '🛏️', descripcion: 'Colchones de resortes, espuma, sommiers usados', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'ropa', nombre: 'Ropa y Textiles', icono: '👕', descripcion: 'Ropa usada, calzado, telas, cortinas, mantas', color: '#DB2777', bg: '#FDF2F8' },
  { id: 'cocinas', nombre: 'Cocinas Inoperativas', icono: '🍳', descripcion: 'Cocinas a gas o eléctricas que no funcionan', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'refrigeradoras', nombre: 'Refrigeradoras', icono: '🧊', descripcion: 'Refrigeradoras, congeladoras, frigoríficos', color: '#0891B2', bg: '#ECFEFF' },
  { id: 'electrodomesticos', nombre: 'Electrodomésticos', icono: '📺', descripcion: 'Televisores, lavadoras, microondas, licuadoras', color: '#059669', bg: '#ECFDF5' },
  { id: 'papel', nombre: 'Papel y Cartón', icono: '📄', descripcion: 'Periódicos, revistas, cajas de cartón, archivos', color: '#D97706', bg: '#FFFBEB' },
  { id: 'vidrio', nombre: 'Vidrio', icono: '🍾', descripcion: 'Botellas de vidrio, frascos, ventanas rotas', color: '#6D28D9', bg: '#F5F3FF' },
  { id: 'muebles', nombre: 'Muebles y Madera', icono: '🪑', descripcion: 'Sillas, mesas, estantes, puertas de madera', color: '#92400E', bg: '#FFFBEB' },
  { id: 'baterias', nombre: 'Baterías y Pilas', icono: '🔋', descripcion: 'Baterías de autos, pilas alcalinas, acumuladores', color: '#B45309', bg: '#FFFBEB' },
  { id: 'aceite', nombre: 'Aceite Usado', icono: '🛢️', descripcion: 'Aceite de cocina, aceite de motor usado', color: '#047857', bg: '#ECFDF5' },
]

const HORARIOS = [
  { dia: 'Lunes', turno: 'Mañana', hora: '8:00 AM – 12:00 PM', zona: 'Infantas, Los Olivos (límite)' },
  { dia: 'Lunes', turno: 'Tarde', hora: '2:00 PM – 6:00 PM', zona: 'Zarumilla, Villanueva' },
  { dia: 'Martes', turno: 'Mañana', hora: '8:00 AM – 12:00 PM', zona: 'Valdiviezo, Santa Luzmila' },
  { dia: 'Martes', turno: 'Tarde', hora: '2:00 PM – 6:00 PM', zona: 'Pro, El Ermitaño' },
  { dia: 'Miércoles', turno: 'Mañana', hora: '8:00 AM – 12:00 PM', zona: 'Condevilla, Naranjal' },
  { dia: 'Miércoles', turno: 'Tarde', hora: '2:00 PM – 6:00 PM', zona: 'Chuquitanta, Márquez' },
  { dia: 'Jueves', turno: 'Mañana', hora: '8:00 AM – 12:00 PM', zona: 'Barboncito, La Libertad' },
  { dia: 'Jueves', turno: 'Tarde', hora: '2:00 PM – 6:00 PM', zona: 'Panamericana, San Eloy' },
  { dia: 'Viernes', turno: 'Mañana', hora: '8:00 AM – 12:00 PM', zona: 'Palao, Fiori' },
  { dia: 'Viernes', turno: 'Tarde', hora: '2:00 PM – 6:00 PM', zona: 'Toda la zona central' },
  { dia: 'Sábado', turno: 'Mañana', hora: '8:00 AM – 1:00 PM', zona: 'Jornada especial – Toda SMP' },
]

const ZONAS_SMP = [
  'Infantas', 'Pro', 'El Ermitaño', 'Condevilla', 'Naranjal', 'Santa Luzmila',
  'Valdiviezo', 'Barboncito', 'La Libertad', 'Palao', 'Fiori', 'Zarumilla',
  'Chuquitanta', 'Márquez', 'Villanueva', 'Panamericana Norte', 'San Eloy',
  'Comas (límite SMP)', 'Centro de SMP', 'Los Alisos'
]

// Units available per material
const UNIDADES_POR_MATERIAL: Record<string, string[]> = {
  metal:            ['kg', 'tonelada'],
  plasticos:        ['kg', 'gr', 'bolsa'],
  colchones:        ['unidad'],
  ropa:             ['kg', 'bolsa', 'unidad'],
  cocinas:          ['unidad'],
  refrigeradoras:   ['unidad'],
  electrodomesticos:['unidad', 'kg'],
  papel:            ['kg', 'atado'],
  vidrio:           ['kg', 'unidad'],
  muebles:          ['unidad'],
  baterias:         ['unidad', 'kg'],
  aceite:           ['litro', 'kg'],
}

const PRECIOS = [
  { id: 'metal',             nombre: 'Metal / Chatarra',      icono: '🔩', unidad: 'kg',      minPrecio: 0.50,  maxPrecio: 1.20,  moneda: 'S/.', nota: 'Fierros, aluminio, cobre, zinc' },
  { id: 'metal_ton',         nombre: 'Metal / Chatarra',      icono: '🔩', unidad: 'tonelada',minPrecio: 450,   maxPrecio: 900,   moneda: 'S/.', nota: 'Por tonelada métrica' },
  { id: 'plasticos_pet',     nombre: 'Plástico PET',          icono: '🍶', unidad: 'kg',      minPrecio: 0.60,  maxPrecio: 1.00,  moneda: 'S/.', nota: 'Botellas transparentes limpias' },
  { id: 'plasticos_duro',    nombre: 'Plástico duro (HDPE)',  icono: '🪣', unidad: 'kg',      minPrecio: 0.30,  maxPrecio: 0.70,  moneda: 'S/.', nota: 'Envases, baldes, tuberías' },
  { id: 'colchon_simple',    nombre: 'Colchón simple/1.5 pl', icono: '🛏️', unidad: 'unidad',  minPrecio: 5.00,  maxPrecio: 12.00, moneda: 'S/.', nota: 'Con resortes o espuma' },
  { id: 'colchon_doble',     nombre: 'Colchón 2 plazas / King','icono': '🛏️', unidad: 'unidad',minPrecio: 10.00, maxPrecio: 20.00, moneda: 'S/.', nota: 'Plazas grandes con resortes' },
  { id: 'ropa',              nombre: 'Ropa / Textiles',        icono: '👕', unidad: 'kg',     minPrecio: 0.30,  maxPrecio: 1.00,  moneda: 'S/.', nota: 'Ropa usada, telas, calzado' },
  { id: 'cocina',            nombre: 'Cocina inoperativa',     icono: '🍳', unidad: 'unidad', minPrecio: 8.00,  maxPrecio: 25.00, moneda: 'S/.', nota: 'A gas o eléctrica, sin gas' },
  { id: 'refrigeradora',     nombre: 'Refrigeradora',          icono: '🧊', unidad: 'unidad', minPrecio: 15.00, maxPrecio: 50.00, moneda: 'S/.', nota: 'Con o sin compresor' },
  { id: 'tv',                nombre: 'Televisor / Monitor',    icono: '📺', unidad: 'unidad', minPrecio: 5.00,  maxPrecio: 20.00, moneda: 'S/.', nota: 'LCD, plasma, tubo' },
  { id: 'electro_peq',       nombre: 'Electrodoméstico pequeño','icono': '🔌', unidad: 'unidad',minPrecio: 2.00,  maxPrecio: 8.00,  moneda: 'S/.', nota: 'Licuadoras, microondas, etc.' },
  { id: 'papel',             nombre: 'Papel / Periódico',      icono: '📰', unidad: 'kg',     minPrecio: 0.10,  maxPrecio: 0.25,  moneda: 'S/.', nota: 'Periódicos, revistas, libros' },
  { id: 'carton',            nombre: 'Cartón',                 icono: '📦', unidad: 'kg',     minPrecio: 0.15,  maxPrecio: 0.40,  moneda: 'S/.', nota: 'Cajas, embalajes, cartón corrugado' },
  { id: 'vidrio',            nombre: 'Vidrio / Botellas',      icono: '🍾', unidad: 'kg',     minPrecio: 0.05,  maxPrecio: 0.20,  moneda: 'S/.', nota: 'Botellas enteras y rotas' },
  { id: 'mueble_madera',     nombre: 'Mueble de madera',       icono: '🪑', unidad: 'unidad', minPrecio: 5.00,  maxPrecio: 20.00, moneda: 'S/.', nota: 'Sillas, mesas, estantes' },
  { id: 'bateria_auto',      nombre: 'Batería de auto',        icono: '🔋', unidad: 'unidad', minPrecio: 8.00,  maxPrecio: 20.00, moneda: 'S/.', nota: 'Acumuladores de plomo-ácido' },
  { id: 'bateria_pilas',     nombre: 'Pilas domésticas',       icono: '🪫', unidad: 'kg',     minPrecio: 0.00,  maxPrecio: 0.00,  moneda: 'S/.', nota: 'Recepción gratuita, no tienen precio de compra' },
  { id: 'aceite_cocina',     nombre: 'Aceite de cocina usado', icono: '🫙', unidad: 'litro',  minPrecio: 0.50,  maxPrecio: 1.20,  moneda: 'S/.', nota: 'Aceite vegetal filtrado' },
  { id: 'cobre',             nombre: 'Cobre / Cable eléctrico','icono': '🔌', unidad: 'kg',    minPrecio: 5.00,  maxPrecio: 9.00,  moneda: 'S/.', nota: 'Cable desnudo o pelado' },
  { id: 'aluminio',          nombre: 'Aluminio (latas)',        icono: '🥫', unidad: 'kg',    minPrecio: 1.50,  maxPrecio: 2.80,  moneda: 'S/.', nota: 'Latas de bebida, perfiles' },
]

// ─── Perú time helper ─────────────────────────────────────────────────────────

function usePeruTime() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const opts: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Lima',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      }
      const dateOpts: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Lima',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }
      setTime(new Intl.DateTimeFormat('es-PE', opts).format(now))
      setDate(new Intl.DateTimeFormat('es-PE', dateOpts).format(now))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return { time, date }
}

// ─── Modal overlay ─────────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,46,26,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ background: 'var(--card)' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Login Modal ───────────────────────────────────────────────────────────────

function LoginModal({ onClose, onLogin, onGoRegister }: { onClose: () => void; onLogin: (u: User) => void; onGoRegister: () => void }) {
  const [correo, setCorreo] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    const stored = localStorage.getItem('reciRuta_user')
    if (!stored) { setError('No hay cuenta registrada. Por favor regístrate primero.'); return }
    const user: User & { password: string } = JSON.parse(stored)
    if (user.correo !== correo || user.password !== pass) { setError('Correo o contraseña incorrectos.'); return }
    onLogin(user)
  }

  return (
    <Overlay onClose={onClose}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>San Martín de Porres · Lima · Perú</div>
            <h2 className="text-2xl" style={{ fontFamily: 'Merriweather, serif', color: 'var(--primary)' }}>Iniciar sesión</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Correo electrónico</label>
            <input type="email" required value={correo} onChange={e => setCorreo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
              placeholder="tu@correo.com"
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Contraseña</label>
            <input type="password" required value={pass} onChange={e => setPass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
              placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            Ingresar
          </button>
        </form>
        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
          ¿No tienes cuenta?{' '}
          <button onClick={onGoRegister} className="font-semibold underline" style={{ color: 'var(--primary)' }}>
            Regístrate aquí
          </button>
        </p>
      </div>
    </Overlay>
  )
}

// ─── Register Modal ────────────────────────────────────────────────────────────

function RegisterModal({ onClose, onRegister }: { onClose: () => void; onRegister: (u: User) => void }) {
  const [form, setForm] = useState({ nombreCompleto: '', dni: '', celular: '', correo: '', direccion: '', zona: 'Infantas', password: '', confirm: '' })
  const [error, setError] = useState('')
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.dni.length !== 8 || !/^\d+$/.test(form.dni)) { setError('El DNI debe tener exactamente 8 dígitos.'); return }
    if (form.celular.length !== 9 || !/^9\d+$/.test(form.celular)) { setError('El celular debe tener 9 dígitos y empezar con 9.'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return }
    const user = { nombreCompleto: form.nombreCompleto, dni: form.dni, celular: form.celular, correo: form.correo, direccion: form.direccion + ', ' + form.zona + ', San Martín de Porres, Lima', distrito: 'San Martín de Porres', password: form.password }
    localStorage.setItem('reciRuta_user', JSON.stringify(user))
    onRegister(user)
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
  const inputStyle = { borderColor: 'var(--border)', background: 'var(--muted)' }
  const labelCls = "block text-sm font-medium mb-1.5"

  return (
    <Overlay onClose={onClose}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>San Martín de Porres · Lima · Perú</div>
            <h2 className="text-2xl" style={{ fontFamily: 'Merriweather, serif', color: 'var(--primary)' }}>Crear cuenta</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Nombre completo</label>
            <input type="text" required value={form.nombreCompleto} onChange={set('nombreCompleto')}
              className={inputCls} style={inputStyle} placeholder="Ej: Juan Carlos Ríos Pérez"
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>DNI</label>
              <input type="text" required maxLength={8} value={form.dni} onChange={set('dni')}
                className={inputCls} style={inputStyle} placeholder="12345678"
                onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Celular</label>
              <input type="text" required maxLength={9} value={form.celular} onChange={set('celular')}
                className={inputCls} style={inputStyle} placeholder="987654321"
                onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Correo electrónico</label>
            <input type="email" required value={form.correo} onChange={set('correo')}
              className={inputCls} style={inputStyle} placeholder="tu@correo.com"
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Dirección (calle y número)</label>
            <input type="text" required value={form.direccion} onChange={set('direccion')}
              className={inputCls} style={inputStyle} placeholder="Ej: Jr. Las Flores 234"
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Zona / Urbanización en SMP</label>
            <select value={form.zona} onChange={set('zona')} className={inputCls} style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
              {ZONAS_SMP.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Contraseña</label>
              <input type="password" required value={form.password} onChange={set('password')}
                className={inputCls} style={inputStyle} placeholder="Mín. 6 caracteres"
                onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Confirmar</label>
              <input type="password" required value={form.confirm} onChange={set('confirm')}
                className={inputCls} style={inputStyle} placeholder="Repetir contraseña"
                onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
            🔒 Solo para residentes de <strong>San Martín de Porres, Lima, Perú</strong>
          </p>
          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            Registrarme
          </button>
        </form>
      </div>
    </Overlay>
  )
}

// ─── Schedule Form Modal ───────────────────────────────────────────────────────

function ScheduleFormModal({ onClose, onDone, userAddress }: { onClose: () => void; onDone: (s: ScheduleItem) => void; userAddress: string }) {
  const [material, setMaterial] = useState(MATERIALES[0].id)
  const [cantidad, setCantidad] = useState('')
  const [unidad, setUnidad] = useState('kg')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('08:00')
  const [dir, setDir] = useState(userAddress)

  const unidades = UNIDADES_POR_MATERIAL[material] || ['kg', 'unidad']

  const handleMaterialChange = (val: string) => {
    setMaterial(val)
    const us = UNIDADES_POR_MATERIAL[val] || ['kg']
    setUnidad(us[0])
  }

  // Price hint for selected material
  const precioRef = PRECIOS.find(p => p.id === material || p.id.startsWith(material))
  const precioHint = precioRef && precioRef.maxPrecio > 0
    ? `Precio estimado: S/. ${precioRef.minPrecio.toFixed(2)} – ${precioRef.maxPrecio.toFixed(2)} / ${precioRef.unidad}`
    : null

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    const item: ScheduleItem = {
      id: Date.now().toString(),
      material: MATERIALES.find(m => m.id === material)?.nombre || material,
      cantidad,
      unidad,
      direccion: dir,
      fecha,
      hora,
      estado: 'pendiente',
    }
    const prev = JSON.parse(localStorage.getItem('reciRuta_schedules') || '[]')
    localStorage.setItem('reciRuta_schedules', JSON.stringify([item, ...prev]))
    onDone(item)
  }

  const inputSt = { borderColor: 'var(--border)', background: 'var(--muted)' }
  const inputCls = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"

  return (
    <Overlay onClose={onClose}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>Nuevo agendamiento</div>
            <h2 className="text-xl" style={{ fontFamily: 'Merriweather, serif', color: 'var(--primary)' }}>Agendar recolección</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <form onSubmit={handle} className="space-y-4">
          {/* Material */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Material a reciclar</label>
            <select value={material} onChange={e => handleMaterialChange(e.target.value)}
              className={inputCls} style={{ ...inputSt, cursor: 'pointer' }}>
              {MATERIALES.map(m => <option key={m.id} value={m.id}>{m.icono} {m.nombre}</option>)}
            </select>
          </div>

          {/* Cantidad + Unidad */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
              Cantidad de material
            </label>
            <div className="flex gap-2">
              <input type="number" required min="0.1" step="0.1" value={cantidad} onChange={e => setCantidad(e.target.value)}
                className={inputCls + ' flex-1'} style={inputSt} placeholder="Ej: 5"
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <select value={unidad} onChange={e => setUnidad(e.target.value)}
                className="px-4 py-3 rounded-xl border text-sm outline-none font-semibold"
                style={{ ...inputSt, cursor: 'pointer', minWidth: '100px', color: 'var(--primary)' }}>
                {unidades.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {precioHint && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
                💰 {precioHint}
                <span className="ml-auto underline cursor-pointer opacity-70" style={{ fontSize: '10px' }}>Ver tabla completa</span>
              </div>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Dirección de recojo</label>
            <input type="text" required value={dir} onChange={e => setDir(e.target.value)}
              className={inputCls} style={inputSt}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Fecha + Turno */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Fecha</label>
              <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Turno</label>
              <select value={hora} onChange={e => setHora(e.target.value)}
                className={inputCls} style={{ ...inputSt, cursor: 'pointer' }}>
                <option value="08:00">Mañana (8:00 AM)</option>
                <option value="10:00">Mañana (10:00 AM)</option>
                <option value="14:00">Tarde (2:00 PM)</option>
                <option value="16:00">Tarde (4:00 PM)</option>
              </select>
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
            <strong>📍 Cobertura:</strong> Solo San Martín de Porres, Lima, Perú. Un reciclador formalizado llegará en el horario seleccionado.
          </div>
          <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            Confirmar recolección
          </button>
        </form>
      </div>
    </Overlay>
  )
}

// ─── Success Modal ─────────────────────────────────────────────────────────────

function SuccessModal({ item, onClose }: { item: ScheduleItem; onClose: () => void }) {
  return (
    <Overlay onClose={onClose}>
      <div className="p-10 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5" style={{ background: 'var(--secondary)' }}>✅</div>
        <h2 className="text-2xl mb-2" style={{ fontFamily: 'Merriweather, serif', color: 'var(--primary)' }}>¡Recolección agendada!</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Un reciclador formalizado de SMP recogerá tu material.</p>
        <div className="rounded-xl p-5 text-left space-y-2 mb-6" style={{ background: 'var(--muted)' }}>
          <p className="text-sm"><span className="font-medium">Material:</span> {item.material}</p>
          <p className="text-sm"><span className="font-medium">Cantidad:</span> {item.cantidad} {item.unidad}</p>
          <p className="text-sm"><span className="font-medium">Dirección:</span> {item.direccion}</p>
          <p className="text-sm"><span className="font-medium">Fecha:</span> {item.fecha}</p>
          <p className="text-sm"><span className="font-medium">Hora:</span> {item.hora}</p>
          <p className="text-sm"><span className="font-medium">Estado:</span> <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>Pendiente</span></p>
        </div>
        <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
          Entendido
        </button>
      </div>
    </Overlay>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ user, page, setPage, onLogin, onRegister, onLogout, onAdminLogin }:
  { user: User | null; page: Page; setPage: (p: Page) => void; onLogin: () => void; onRegister: () => void; onLogout: () => void; onAdminLogin: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { time } = usePeruTime()

  const navItems: { label: string; p: Page }[] = [
    { label: 'Inicio', p: 'home' },
    { label: 'Materiales', p: 'materials' },
    { label: 'Precios', p: 'prices' },
    { label: 'Horarios', p: 'schedule' },
    ...(user ? [{ label: 'Mi Panel', p: 'dashboard' as Page }, { label: 'Mi Perfil', p: 'profile' as Page }] : []),
  ]

  return (
    <nav className="sticky top-0 z-40 border-b" style={{ background: 'var(--primary)', borderColor: 'rgba(255,255,255,0.1)' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => setPage('home')} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>R</div>
          <div className="text-left">
            <div className="font-bold text-white text-lg leading-none" style={{ fontFamily: 'Merriweather, serif' }}>ReciRuta</div>
            <div className="text-xs opacity-70 text-white">San Martín de Porres</div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(n => (
            <button key={n.p} onClick={() => setPage(n.p)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ color: page === n.p ? 'var(--accent)' : 'rgba(255,255,255,0.8)', background: page === n.p ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
              {n.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}>
            🇵🇪 {time}
          </span>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white opacity-80">{user.nombreCompleto.split(' ')[0]}</span>
              <button onClick={onLogout} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                Salir
              </button>
            </div>
          ) : (
            <>
              <button onClick={onLogin} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:bg-white/10">Ingresar</button>
              <button onClick={onRegister} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
                Regístrate
              </button>
              <button onClick={onAdminLogin} className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(220,38,38,0.25)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.3)' }}>
                Admin
              </button>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-xl">☰</button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-2" style={{ background: 'var(--primary)', borderColor: 'rgba(255,255,255,0.1)' }}>
          {navItems.map(n => (
            <button key={n.p} onClick={() => { setPage(n.p); setMenuOpen(false) }}
              className="block w-full text-left px-4 py-2 rounded-lg text-sm text-white opacity-90">
              {n.label}
            </button>
          ))}
          <div className="pt-2 flex flex-wrap gap-2">
            {user ? (
              <button onClick={() => { onLogout(); setMenuOpen(false) }} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                Salir
              </button>
            ) : (
              <>
                <button onClick={() => { onLogin(); setMenuOpen(false) }} className="flex-1 py-2 rounded-lg text-sm text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  Ingresar
                </button>
                <button onClick={() => { onRegister(); setMenuOpen(false) }} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
                  Regístrate
                </button>
                <button onClick={() => { onAdminLogin(); setMenuOpen(false) }} className="w-full py-2 rounded-lg text-sm font-semibold" style={{ background: 'rgba(220,38,38,0.2)', color: '#FCA5A5' }}>
                  🔒 Panel Admin
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Home Page ─────────────────────────────────────────────────────────────────

// Floating recycling icon component
function FloatingIcon({ emoji, style }: { emoji: string; style: React.CSSProperties }) {
  return (
    <div className="absolute select-none pointer-events-none" style={{ fontSize: '2.2rem', opacity: 0.18, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))', ...style }}>
      {emoji}
    </div>
  )
}

function HomePage({ user, onRegister, onSchedule, onPrices }: { user: User | null; onRegister: () => void; onSchedule: () => void; onPrices: () => void }) {
  const { time, date } = usePeruTime()

  // Ticker items
  const tickerItems = ['♻️ Metal', '🍶 Plástico', '🛏️ Colchones', '👕 Ropa', '🍳 Cocinas', '🧊 Refrigeradoras', '📺 Electrodomésticos', '📦 Cartón', '🍾 Vidrio', '🪑 Muebles', '🔋 Baterías', '🫙 Aceite']

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'var(--primary)', minHeight: '580px' }}>

        {/* Background image with overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1400&h=700&fit=crop&auto=format)`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,46,26,0.92) 0%, rgba(45,90,39,0.85) 50%, rgba(26,46,26,0.75) 100%)' }} />

        {/* Animated floating icons */}
        <FloatingIcon emoji="♻️" style={{ top: '12%', left: '5%',  animationName: 'float',  animationDuration: '6s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} />
        <FloatingIcon emoji="🔩" style={{ top: '25%', left: '12%', animationName: 'float2', animationDuration: '8s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: '1s' }} />
        <FloatingIcon emoji="🍶" style={{ top: '60%', left: '7%',  animationName: 'float3', animationDuration: '5s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: '2s' }} />
        <FloatingIcon emoji="📦" style={{ top: '10%', right: '22%', animationName: 'float',  animationDuration: '7s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: '0.5s' }} />
        <FloatingIcon emoji="🧊" style={{ top: '70%', right: '8%', animationName: 'float2', animationDuration: '9s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: '1.5s' }} />
        <FloatingIcon emoji="👕" style={{ top: '45%', left: '3%', animationName: 'float3', animationDuration: '6.5s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: '3s' }} />

        {/* Spinning ring decoration */}
        <div className="absolute anim-spin hidden lg:block" style={{
          right: '6%', top: '15%', width: '260px', height: '260px',
          border: '2px dashed rgba(124,191,110,0.25)', borderRadius: '50%',
        }} />
        <div className="absolute anim-spin-r hidden lg:block" style={{
          right: '10%', top: '22%', width: '180px', height: '180px',
          border: '1px solid rgba(124,191,110,0.15)', borderRadius: '50%',
        }} />

        {/* Right image card */}
        <div className="absolute bottom-6 right-6 hidden xl:block rounded-2xl overflow-hidden shadow-2xl" style={{ width: '240px', height: '190px', border: '2px solid rgba(255,255,255,0.15)' }}>
          <img
            src="https://images.unsplash.com/photo-1574974671999-24b7dfbb0d53?w=480&h=380&fit=crop&auto=format"
            alt="Recicladores recolectando residuos"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,46,26,0.7) 0%, transparent 60%)' }} />
          <div className="absolute bottom-3 left-3 text-xs font-semibold text-white">Recicladores en acción · SMP</div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20 relative">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              🇵🇪 San Martín de Porres · Lima · Perú
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight anim-fadeup" style={{ fontFamily: 'Merriweather, serif' }}>
              Recicla en SMP.<br />Agenda tu<br />
              <span style={{ color: 'var(--accent)' }}>recolección.</span>
            </h1>
            <p className="text-base mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Plataforma digital que conecta recicladores formalizados con hogares y negocios de San Martín de Porres. Confiable, gratuita y con pago por kilo.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <button onClick={onSchedule}
                  className="px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 anim-pulse"
                  style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
                  + Agendar recolección
                </button>
              ) : (
                <button onClick={onRegister}
                  className="px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
                  Comenzar gratis
                </button>
              )}
              <button onClick={onPrices}
                className="px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-white/15"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                💰 Ver precios por material
              </button>
            </div>

            {/* Time widget inline */}
            <div className="mt-10 inline-flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span className="text-xl">🕐</span>
              <div>
                <div className="text-lg font-mono font-bold text-white leading-none">{time}</div>
                <div className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.55)' }}>{date} · Lima GMT-5</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated materials ticker */}
      <div className="overflow-hidden py-3 border-b" style={{ background: '#1a2e1a', borderColor: '#2d4a2d' }}>
        <div className="flex gap-10 anim-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-sm font-medium" style={{ color: 'rgba(124,191,110,0.85)' }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: '180K+', l: 'Recicladores en Perú' },
            { n: '12', l: 'Materiales aceptados' },
            { n: '20', l: 'Zonas en SMP' },
            { n: '6', l: 'Días de recolección' },
          ].map(s => (
            <div key={s.n} className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)', fontFamily: 'Merriweather, serif' }}>{s.n}</div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Beneficiarios */}
      <section className="py-20 px-4" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>Público Beneficiario</p>
          <h2 className="text-3xl mb-12" style={{ fontFamily: 'Merriweather, serif', color: 'var(--foreground)' }}>¿A quién impacta la solución?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { letra: 'R', titulo: 'Recicladores informales', texto: 'Cerca de 180 mil personas en el Perú, en su mayoría en pobreza. Reciben rutas fijas, ingresos más estables y visibilidad para formalizarse.' },
              { letra: 'H', titulo: 'Hogares y negocios', texto: 'Vecinos y comercios de SMP que hoy no saben cómo ni a quién entregar su material reciclable de forma confiable.' },
              { letra: 'M', titulo: 'Municipalidades', texto: 'Ganan datos reales de recolección para diseñar mejores rutas y políticas de segregación en la fuente.' },
            ].map(b => (
              <div key={b.letra} className="rounded-2xl p-7 border transition-all hover:shadow-md" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white mb-5" style={{ background: 'var(--primary)' }}>
                  {b.letra}
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'Merriweather, serif', color: 'var(--foreground)' }}>{b.titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 px-4" style={{ background: 'var(--primary)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>Solución Propuesta</p>
          <h2 className="text-3xl mb-4 text-white" style={{ fontFamily: 'Merriweather, serif' }}>¿Cómo funciona ReciRuta?</h2>
          <p className="text-base mb-12" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Los hogares agendan una recolección de material reciclable y el sistema la asigna al reciclador formal más cercano dentro de su ruta.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '1', t: 'Agenda tu recolección', d: 'El vecino elige día, turno y tipo de material (metal, plástico, ropa, electros...) desde la plataforma.' },
              { n: '2', t: 'Asignación y confirmación', d: 'El sistema asigna al reciclador formalizado más cercano de tu zona en SMP y confirma la visita.' },
              { n: '3', t: 'Perfil del reciclador', d: 'Cada reciclador queda registrado con sus datos, listo para su formalización y pago digital por kilo.' },
            ].map(s => (
              <div key={s.n} className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mb-5" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
                  {s.n}
                </div>
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Merriweather, serif' }}>{s.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 px-4 text-center" style={{ background: 'var(--secondary)' }}>
          <h2 className="text-3xl mb-4" style={{ fontFamily: 'Merriweather, serif', color: 'var(--primary)' }}>Únete a ReciRuta hoy</h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Regístrate gratis con tu DNI y datos personales. Solo para vecinos de San Martín de Porres, Lima, Perú.
          </p>
          <button onClick={onRegister} className="px-10 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            Crear mi cuenta gratis
          </button>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
        <strong style={{ color: 'var(--primary)' }}>ReciRuta</strong> · San Martín de Porres, Lima, Perú · 🇵🇪 · {new Date().getFullYear()}
        <br className="md:hidden" />
        <span className="hidden md:inline"> · </span>
        Solo para residentes de SMP · Horario Lima (GMT-5)
      </footer>
    </div>
  )
}

// ─── Materials Page ────────────────────────────────────────────────────────────

function MaterialsPage({ onSchedule, user }: { onSchedule: () => void; user: User | null }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>Catálogo</p>
      <h2 className="text-3xl mb-2" style={{ fontFamily: 'Merriweather, serif', color: 'var(--foreground)' }}>Materiales que reciclamos</h2>
      <p className="text-base mb-10" style={{ color: 'var(--muted-foreground)' }}>
        Todo lo que puedes entregar en San Martín de Porres. Haz clic en cada material para ver detalles.
      </p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {MATERIALES.map(m => (
          <button key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
            className="rounded-2xl p-6 text-left border transition-all hover:shadow-lg hover:scale-105"
            style={{ background: selected === m.id ? m.bg : 'var(--card)', borderColor: selected === m.id ? m.color : 'var(--border)', transform: selected === m.id ? 'scale(1.02)' : '' }}>
            <div className="text-4xl mb-3">{m.icono}</div>
            <div className="font-bold text-sm mb-1" style={{ color: selected === m.id ? m.color : 'var(--foreground)' }}>{m.nombre}</div>
            {selected === m.id && <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--muted-foreground)' }}>{m.descripcion}</p>}
          </button>
        ))}
      </div>

      <div className="mt-12 rounded-2xl p-8 text-center border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
        <div className="text-3xl mb-3">♻️</div>
        <h3 className="text-xl mb-2" style={{ fontFamily: 'Merriweather, serif', color: 'var(--primary)' }}>¿Tienes algo que reciclar?</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Agenda tu recolección gratuita en San Martín de Porres.</p>
        {user ? (
          <button onClick={onSchedule} className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            Agendar ahora
          </button>
        ) : (
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Inicia sesión para agendar tu recolección.</p>
        )}
      </div>
    </div>
  )
}

// ─── Schedule Page ─────────────────────────────────────────────────────────────

function SchedulePage({ onSchedule, user }: { onSchedule: () => void; user: User | null }) {
  const { time, date } = usePeruTime()
  const [filterDia, setFilterDia] = useState<string>('Todos')
  const dias = ['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const filtered = filterDia === 'Todos' ? HORARIOS : HORARIOS.filter(h => h.dia === filterDia)

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>Horarios</p>
      <h2 className="text-3xl mb-2" style={{ fontFamily: 'Merriweather, serif', color: 'var(--foreground)' }}>Rutas de recolección</h2>
      <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>Horario oficial Lima, Perú (GMT-5) · Solo San Martín de Porres</p>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-mono text-sm" style={{ background: 'var(--primary)', color: 'white' }}>
        🕐 {time} — {date}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {dias.map(d => (
          <button key={d} onClick={() => setFilterDia(d)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: filterDia === d ? 'var(--primary)' : 'var(--card)', color: filterDia === d ? '#fff' : 'var(--foreground)', border: `1px solid ${filterDia === d ? 'var(--primary)' : 'var(--border)'}` }}>
            {d}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((h, i) => (
          <div key={i} className="rounded-2xl p-6 border flex flex-wrap items-center gap-4 justify-between" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center" style={{ background: 'var(--secondary)' }}>
                <div className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{h.dia.substring(0, 3).toUpperCase()}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{h.turno}</div>
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{h.dia} — {h.turno}</div>
                <div className="text-sm font-mono" style={{ color: 'var(--primary)' }}>{h.hora}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>📍 {h.zona}</div>
              </div>
            </div>
            {user && (
              <button onClick={onSchedule} className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
                Agendar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl p-6 text-sm" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
        <strong style={{ color: 'var(--foreground)' }}>Notas importantes:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>El servicio opera únicamente en <strong>San Martín de Porres, Lima, Perú</strong>.</li>
          <li>Los horarios pueden variar por feriados nacionales.</li>
          <li>Colchones y electrodomésticos grandes requieren coordinación previa al agendar.</li>
          <li>Horario Lima GMT-5 · No aplica horario de verano.</li>
        </ul>
      </div>
    </div>
  )
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

function DashboardPage({ user, onSchedule }: { user: User; onSchedule: () => void }) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('reciRuta_schedules') || '[]')
    setSchedules(stored)
  }, [])

  const estadoColor = (e: string) => e === 'completado' ? '#059669' : e === 'confirmado' ? '#2563EB' : '#D97706'
  const estadoBg = (e: string) => e === 'completado' ? '#ECFDF5' : e === 'confirmado' ? '#EFF6FF' : '#FFFBEB'

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>Mi Panel</p>
          <h2 className="text-3xl" style={{ fontFamily: 'Merriweather, serif', color: 'var(--foreground)' }}>
            Hola, {user.nombreCompleto.split(' ')[0]}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{user.direccion}</p>
        </div>
        <button onClick={onSchedule} className="px-7 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          + Nueva recolección
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        {[
          { n: schedules.length, l: 'Total agendadas', c: 'var(--primary)' },
          { n: schedules.filter(s => s.estado === 'pendiente').length, l: 'Pendientes', c: '#D97706' },
          { n: schedules.filter(s => s.estado === 'completado').length, l: 'Completadas', c: '#059669' },
        ].map(s => (
          <div key={s.l} className="rounded-2xl p-6 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="text-4xl font-bold mb-1" style={{ color: s.c, fontFamily: 'Merriweather, serif' }}>{s.n}</div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--foreground)' }}>Mis recolecciones</h3>

      {schedules.length === 0 ? (
        <div className="rounded-2xl p-12 text-center border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-5xl mb-4">♻️</div>
          <p className="text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>Aún no tienes recolecciones agendadas</p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Agenda tu primera recolección gratuita en SMP.</p>
          <button onClick={onSchedule} className="px-7 py-3 rounded-xl font-semibold text-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
            Agendar ahora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map(s => (
            <div key={s.id} className="rounded-2xl p-6 border flex flex-wrap gap-4 items-center justify-between" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>{s.material}</div>
                <div className="text-xs mb-0.5 font-medium" style={{ color: 'var(--primary)' }}>⚖️ {s.cantidad} {s.unidad}</div>
                <div className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>📍 {s.direccion}</div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>📅 {s.fecha} · ⏰ {s.hora}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: estadoBg(s.estado), color: estadoColor(s.estado) }}>
                {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Profile Page ──────────────────────────────────────────────────────────────

function ProfilePage({ user }: { user: User }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>Cuenta</p>
      <h2 className="text-3xl mb-8" style={{ fontFamily: 'Merriweather, serif', color: 'var(--foreground)' }}>Mi Perfil</h2>

      <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="px-8 py-6 flex items-center gap-5" style={{ background: 'var(--primary)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
            {user.nombreCompleto.charAt(0)}
          </div>
          <div>
            <div className="text-xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>{user.nombreCompleto}</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Vecino registrado · SMP</div>
          </div>
        </div>
        <div className="p-8 space-y-5">
          {[
            { label: 'DNI', value: user.dni, icon: '🪪' },
            { label: 'Celular', value: user.celular, icon: '📱' },
            { label: 'Correo', value: user.correo, icon: '✉️' },
            { label: 'Dirección', value: user.direccion, icon: '📍' },
            { label: 'Distrito', value: 'San Martín de Porres, Lima, Perú', icon: '🇵🇪' },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-4 pb-5 border-b last:border-b-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{f.label}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{f.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl p-5 text-sm" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
        🔒 Tus datos personales están protegidos y solo se usan para la gestión de recolecciones en San Martín de Porres.
      </div>
    </div>
  )
}

// ─── Prices Page ──────────────────────────────────────────────────────────────

function PricesPage({ onSchedule, user }: { onSchedule: () => void; user: User | null }) {
  const [search, setSearch] = useState('')
  const [filterUnidad, setFilterUnidad] = useState('Todos')
  const unidades = ['Todos', 'kg', 'unidad', 'litro', 'tonelada']

  const filtered = PRECIOS.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.nota.toLowerCase().includes(search.toLowerCase())
    const matchUnidad = filterUnidad === 'Todos' || p.unidad === filterUnidad
    return matchSearch && matchUnidad
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-12" style={{ minHeight: '200px' }}>
        <img
          src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=1000&h=300&fit=crop&auto=format"
          alt="Contenedores de reciclaje"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,46,26,0.88) 0%, rgba(45,90,39,0.75) 100%)' }} />
        <div className="relative p-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>Tabla de precios</p>
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Merriweather, serif' }}>¿Cuánto pagamos por tu material?</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Precios referenciales en San Martín de Porres · Lima, Perú. Actualizados julio 2026.
          </p>
        </div>
      </div>

      {/* Notice */}
      <div className="flex flex-wrap gap-4 items-start mb-8 p-5 rounded-2xl" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
        <span className="text-3xl">💡</span>
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--primary)' }}>¿Cómo funciona el pago?</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            El reciclador formalizado pesa o cuenta el material al recogerlo y paga en el momento. Los precios son referenciales y pueden variar según la calidad, estado y volumen del material entregado. Las pilas y algunos residuos especiales se reciben <strong>gratuitamente</strong> por norma ambiental.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar material..."
          className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        />
        {unidades.map(u => (
          <button key={u} onClick={() => setFilterUnidad(u)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: filterUnidad === u ? 'var(--primary)' : 'var(--card)', color: filterUnidad === u ? '#fff' : 'var(--foreground)', border: `1px solid ${filterUnidad === u ? 'var(--primary)' : 'var(--border)'}` }}>
            {u === 'Todos' ? 'Todos' : `/ ${u}`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wide" style={{ background: 'var(--primary)', color: 'rgba(255,255,255,0.7)' }}>
          <div className="col-span-5">Material</div>
          <div className="col-span-2 text-center">Unidad</div>
          <div className="col-span-3 text-center">Precio (S/.)</div>
          <div className="col-span-2 text-right">Acción</div>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)', background: 'var(--card)' }}>
            No se encontraron materiales con ese filtro.
          </div>
        )}

        {filtered.map((p, i) => (
          <div key={p.id}
            className="grid grid-cols-12 gap-2 px-6 py-4 items-center border-b last:border-b-0 transition-colors hover:bg-[var(--muted)]"
            style={{ background: i % 2 === 0 ? 'var(--card)' : 'var(--background)', borderColor: 'var(--border)' }}>

            {/* Material */}
            <div className="col-span-5 flex items-center gap-3">
              <span className="text-2xl">{p.icono}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{p.nombre}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.nota}</div>
              </div>
            </div>

            {/* Unidad */}
            <div className="col-span-2 text-center">
              <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
                {p.unidad}
              </span>
            </div>

            {/* Precio */}
            <div className="col-span-3 text-center">
              {p.maxPrecio === 0 ? (
                <span className="text-sm font-bold" style={{ color: '#059669' }}>Gratuito</span>
              ) : p.minPrecio === p.maxPrecio ? (
                <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>S/. {p.minPrecio.toFixed(2)}</span>
              ) : (
                <div>
                  <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                    S/. {p.minPrecio.toFixed(2)} – {p.maxPrecio.toFixed(2)}
                  </span>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>por {p.unidad}</div>
                </div>
              )}
            </div>

            {/* Action */}
            <div className="col-span-2 text-right">
              {user ? (
                <button onClick={onSchedule}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
                  Agendar
                </button>
              ) : (
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 rounded-2xl overflow-hidden relative" style={{ minHeight: '140px' }}>
        <img
          src="https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=900&h=280&fit=crop&auto=format"
          alt="Señal de reciclaje"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(26,46,26,0.82)' }} />
        <div className="relative p-8 flex flex-wrap items-center gap-6 justify-between">
          <div>
            <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Merriweather, serif' }}>¿Listo para reciclar?</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Agenda tu recolección gratuita en SMP y recibe tu pago.</p>
          </div>
          {user ? (
            <button onClick={onSchedule} className="px-7 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
              Agendar ahora
            </button>
          ) : (
            <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Inicia sesión para agendar →</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Admin Login Modal ─────────────────────────────────────────────────────────

function AdminLoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (a: typeof ADMINS[0]) => void }) {
  const [usuario, setUsuario] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    const found = ADMINS.find(a => a.usuario === usuario && a.password === pass)
    if (!found) { setError('Credenciales incorrectas.'); return }
    onSuccess(found)
  }

  return (
    <Overlay onClose={onClose}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#EF4444' }}>Acceso Restringido</div>
            <h2 className="text-2xl" style={{ fontFamily: 'Merriweather, serif', color: 'var(--primary)' }}>Panel Administrativo</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <span className="text-xl">🔒</span>
          <p className="text-xs" style={{ color: '#991B1B' }}>Solo personal autorizado de ReciRuta y la Municipalidad de San Martín de Porres.</p>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Usuario administrador</label>
            <input type="text" required value={usuario} onChange={e => setUsuario(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--muted)' }} placeholder="usuario"
              onFocus={e => e.target.style.borderColor = '#DC2626'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Contraseña</label>
            <input type="password" required value={pass} onChange={e => setPass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--muted)' }} placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = '#DC2626'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: '#DC2626', color: '#fff' }}>
            Ingresar al panel
          </button>
        </form>
        <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
          Demo: usuario <code className="bg-gray-100 px-1 rounded">admin</code> · contraseña <code className="bg-gray-100 px-1 rounded">reciruta2024</code>
        </p>
      </div>
    </Overlay>
  )
}

// ─── Admin Page ────────────────────────────────────────────────────────────────

function AdminPage({ admin, onLogout }: { admin: typeof ADMINS[0]; onLogout: () => void }) {
  const [tab, setTab] = useState<'overview' | 'users' | 'schedules' | 'materials'>('overview')
  const { time, date } = usePeruTime()

  // Load all data from localStorage (simulated multi-user in demo)
  const allUsers: (User & { password: string; creadoEn?: string })[] = (() => {
    const u = localStorage.getItem('reciRuta_user')
    return u ? [{ ...JSON.parse(u), creadoEn: new Date().toLocaleDateString('es-PE') }] : []
  })()

  const allSchedules: ScheduleItem[] = JSON.parse(localStorage.getItem('reciRuta_schedules') || '[]')

  // Material usage stats
  const materialStats = MATERIALES.map(m => ({
    ...m,
    count: allSchedules.filter(s => s.material === m.nombre).length,
  })).sort((a, b) => b.count - a.count)

  const pendientes = allSchedules.filter(s => s.estado === 'pendiente').length
  const confirmados = allSchedules.filter(s => s.estado === 'confirmado').length
  const completados = allSchedules.filter(s => s.estado === 'completado').length

  // Change schedule status
  const [schedules, setSchedules] = useState<ScheduleItem[]>(allSchedules)
  const changeEstado = (id: string, estado: ScheduleItem['estado']) => {
    const updated = schedules.map(s => s.id === id ? { ...s, estado } : s)
    setSchedules(updated)
    localStorage.setItem('reciRuta_schedules', JSON.stringify(updated))
  }

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'users', label: 'Usuarios', icon: '👥' },
    { id: 'schedules', label: 'Recolecciones', icon: '📅' },
    { id: 'materials', label: 'Materiales', icon: '♻️' },
  ] as const

  const statCard = (n: number | string, label: string, icon: string, color: string, bg: string) => (
    <div className="rounded-2xl p-6 border" style={{ background: bg, borderColor: color + '30' }}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1" style={{ color, fontFamily: 'Merriweather, serif' }}>{n}</div>
      <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
    </div>
  )

  const estadoBadge = (e: string) => {
    const map: Record<string, [string, string]> = {
      pendiente: ['#D97706', '#FFFBEB'],
      confirmado: ['#2563EB', '#EFF6FF'],
      completado: ['#059669', '#ECFDF5'],
    }
    const [c, bg] = map[e] || ['#6B7280', '#F9FAFB']
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color: c }}>
        {e.charAt(0).toUpperCase() + e.slice(1)}
      </span>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1A0F' }}>
      {/* Admin Topbar */}
      <div className="border-b px-6 h-16 flex items-center justify-between" style={{ background: '#1A2E1A', borderColor: '#2D4A2D' }}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#DC2626', color: '#fff' }}>A</div>
          <div>
            <div className="text-sm font-bold text-white">ReciRuta — Panel Admin</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{admin.nombre} · {admin.rol}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono px-3 py-1.5 rounded-full hidden sm:inline" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
            🇵🇪 {time}
          </span>
          <button onClick={onLogout} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: '#DC2626', color: '#fff' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen border-r hidden md:block" style={{ background: '#142014', borderColor: '#2D4A2D' }}>
          <div className="p-4 mt-2 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
                style={{
                  background: tab === t.id ? 'rgba(124,191,110,0.15)' : 'transparent',
                  color: tab === t.id ? '#7CBF6E' : 'rgba(255,255,255,0.55)',
                  borderLeft: tab === t.id ? '3px solid #7CBF6E' : '3px solid transparent',
                }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <div className="p-4 mt-4 mx-4 rounded-xl text-xs" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: 'rgba(255,255,255,0.45)' }}>
            🔒 Acceso restringido<br />Solo personal autorizado
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t" style={{ background: '#1A2E1A', borderColor: '#2D4A2D' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center gap-1 py-3 text-xs"
              style={{ color: tab === t.id ? '#7CBF6E' : 'rgba(255,255,255,0.45)' }}>
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 pb-24 md:pb-6 overflow-auto">
          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <div className="mb-8">
                <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#7CBF6E' }}>Panel de control</p>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>Resumen general</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>San Martín de Porres · {date}</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCard(allUsers.length, 'Usuarios registrados', '👥', '#7CBF6E', '#1A2E1A')}
                {statCard(schedules.length, 'Total recolecciones', '📅', '#60A5FA', '#1A2535')}
                {statCard(pendientes, 'Pendientes', '⏳', '#FBBF24', '#2A2010')}
                {statCard(completados, 'Completadas', '✅', '#34D399', '#0F2A1A')}
              </div>

              {/* Activity chart — bar visual */}
              <div className="rounded-2xl p-6 mb-6" style={{ background: '#1A2E1A', border: '1px solid #2D4A2D' }}>
                <h3 className="text-sm font-bold text-white mb-5">Recolecciones por material</h3>
                <div className="space-y-3">
                  {materialStats.filter(m => m.count > 0).length === 0 ? (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Aún no hay recolecciones agendadas.</p>
                  ) : (
                    materialStats.filter(m => m.count > 0).map(m => (
                      <div key={m.id} className="flex items-center gap-4">
                        <span className="text-lg w-8">{m.icono}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{m.nombre}</span>
                            <span style={{ color: '#7CBF6E' }}>{m.count}</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (m.count / Math.max(1, schedules.length)) * 100)}%`, background: '#7CBF6E' }} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {materialStats.filter(m => m.count === 0).length > 0 && schedules.length > 0 && (
                    materialStats.filter(m => m.count === 0).map(m => (
                      <div key={m.id} className="flex items-center gap-4">
                        <span className="text-lg w-8">{m.icono}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'rgba(255,255,255,0.35)' }}>{m.nombre}</span>
                            <span style={{ color: 'rgba(255,255,255,0.35)' }}>0</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Estado breakdown */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Pendientes', count: pendientes, color: '#FBBF24', bg: '#2A2010' },
                  { label: 'Confirmados', count: confirmados, color: '#60A5FA', bg: '#1A2535' },
                  { label: 'Completados', count: completados, color: '#34D399', bg: '#0F2A1A' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5 text-center" style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: s.color, fontFamily: 'Merriweather, serif' }}>{s.count}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#7CBF6E' }}>Gestión</p>
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>Usuarios registrados</h2>
                </div>
                <div className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(124,191,110,0.15)', color: '#7CBF6E' }}>
                  {allUsers.length} usuarios
                </div>
              </div>

              {allUsers.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ background: '#1A2E1A', border: '1px solid #2D4A2D' }}>
                  <div className="text-5xl mb-4">👥</div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Aún no hay usuarios registrados en el sistema.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allUsers.map((u, i) => (
                    <div key={i} className="rounded-2xl p-6 border" style={{ background: '#1A2E1A', borderColor: '#2D4A2D' }}>
                      <div className="flex items-start gap-5 flex-wrap">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: 'rgba(124,191,110,0.2)', color: '#7CBF6E' }}>
                          {u.nombreCompleto.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-bold text-white mb-1">{u.nombreCompleto}</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            {[
                              { l: 'DNI', v: u.dni },
                              { l: 'Celular', v: u.celular },
                              { l: 'Correo', v: u.correo },
                              { l: 'Zona', v: u.distrito },
                            ].map(f => (
                              <div key={f.l}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.l}</div>
                                <div className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{f.v}</div>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>📍 {u.direccion}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(124,191,110,0.15)', color: '#7CBF6E' }}>Activo</span>
                          <div className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Recolecciones: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{schedules.filter(s => !s.usuarioDni || s.usuarioDni === u.dni).length}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Schedules */}
          {tab === 'schedules' && (
            <div>
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#7CBF6E' }}>Gestión</p>
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>Recolecciones agendadas</h2>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#2A2010', color: '#FBBF24' }}>⏳ {pendientes} pendientes</span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#0F2A1A', color: '#34D399' }}>✅ {completados} completos</span>
                </div>
              </div>

              {schedules.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ background: '#1A2E1A', border: '1px solid #2D4A2D' }}>
                  <div className="text-5xl mb-4">📅</div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>No hay recolecciones agendadas aún.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map(s => (
                    <div key={s.id} className="rounded-2xl p-5 border" style={{ background: '#1A2E1A', borderColor: '#2D4A2D' }}>
                      <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base font-bold text-white">{s.material}</span>
                            {estadoBadge(s.estado)}
                          </div>
                          <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>📍 {s.direccion}</div>
                          <div className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>📅 {s.fecha} · ⏰ {s.hora}</div>
                        </div>
                        {/* Admin can change status */}
                        <div className="flex gap-2 flex-wrap">
                          {s.estado !== 'confirmado' && (
                            <button onClick={() => changeEstado(s.id, 'confirmado')}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                              style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA' }}>
                              Confirmar
                            </button>
                          )}
                          {s.estado !== 'completado' && (
                            <button onClick={() => changeEstado(s.id, 'completado')}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                              style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}>
                              Completar
                            </button>
                          )}
                          {s.estado !== 'pendiente' && (
                            <button onClick={() => changeEstado(s.id, 'pendiente')}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                              style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24' }}>
                              Pendiente
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Materials stats */}
          {tab === 'materials' && (
            <div>
              <div className="mb-8">
                <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#7CBF6E' }}>Estadísticas</p>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>Materiales más solicitados</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Basado en recolecciones agendadas en SMP</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {materialStats.map((m, idx) => (
                  <div key={m.id} className="rounded-2xl p-5 border" style={{ background: '#1A2E1A', borderColor: m.count > 0 ? '#2D5A27' : '#1E3A1E' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{m.icono}</span>
                      {idx === 0 && m.count > 0 && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24' }}>🥇 Más solicitado</span>}
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{m.nombre}</div>
                    <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.descripcion}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold" style={{ color: m.count > 0 ? '#7CBF6E' : 'rgba(255,255,255,0.2)', fontFamily: 'Merriweather, serif' }}>{m.count}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>recolección{m.count !== 1 ? 'es' : ''}</div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${schedules.length > 0 ? Math.min(100, (m.count / schedules.length) * 100) : 0}%`, background: m.count > 0 ? '#7CBF6E' : 'transparent', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── App root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [modal, setModal] = useState<Modal>('none')
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('reciRuta_user')
    return s ? JSON.parse(s) : null
  })
  const [admin, setAdmin] = useState<typeof ADMINS[0] | null>(null)
  const [lastSchedule, setLastSchedule] = useState<ScheduleItem | null>(null)

  const handleLogin = (u: User) => { setUser(u); setModal('none'); setPage('dashboard') }
  const handleRegister = (u: User) => { setUser(u); setModal('none'); setPage('dashboard') }
  const handleLogout = () => { setUser(null); setPage('home') }
  const openSchedule = () => user ? setModal('schedule-form') : setModal('login')
  const openPrices = () => setPage('prices')

  // If admin is logged in, render the full admin panel
  if (admin) {
    return <AdminPage admin={admin} onLogout={() => { setAdmin(null); setPage('home') }} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar user={user} page={page} setPage={setPage}
        onLogin={() => setModal('login')}
        onRegister={() => setModal('register')}
        onLogout={handleLogout}
        onAdminLogin={() => setModal('admin-login')}
      />

      {page === 'home' && <HomePage user={user} onRegister={() => setModal('register')} onSchedule={openSchedule} onPrices={openPrices} />}
      {page === 'materials' && <MaterialsPage onSchedule={openSchedule} user={user} />}
      {page === 'prices' && <PricesPage onSchedule={openSchedule} user={user} />}
      {page === 'schedule' && <SchedulePage onSchedule={openSchedule} user={user} />}
      {page === 'dashboard' && user && <DashboardPage user={user} onSchedule={openSchedule} />}
      {page === 'profile' && user && <ProfilePage user={user} />}

      {modal === 'login' && (
        <LoginModal onClose={() => setModal('none')} onLogin={handleLogin} onGoRegister={() => setModal('register')} />
      )}
      {modal === 'register' && (
        <RegisterModal onClose={() => setModal('none')} onRegister={handleRegister} />
      )}
      {modal === 'schedule-form' && user && (
        <ScheduleFormModal
          onClose={() => setModal('none')}
          userAddress={user.direccion}
          onDone={item => { setLastSchedule(item); setModal('success') }}
        />
      )}
      {modal === 'success' && lastSchedule && (
        <SuccessModal item={lastSchedule} onClose={() => { setModal('none'); setPage('dashboard') }} />
      )}
      {modal === 'admin-login' && (
        <AdminLoginModal onClose={() => setModal('none')} onSuccess={a => { setAdmin(a); setModal('none') }} />
      )}
    </div>
  )
}
