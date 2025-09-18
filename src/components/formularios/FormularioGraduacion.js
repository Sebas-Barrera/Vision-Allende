'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FormularioGraduacion({ clienteId, graduacionExistente = null, tipoInicial = 'lejos' }) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [cliente, setCliente] = useState(null)
  const [archivoImagen, setArchivoImagen] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState('')

  // Estado del formulario de graduación
  const [datosGraduacion, setDatosGraduacion] = useState({
    tipo: tipoInicial, // Usar el tipo inicial pasado como prop
    
    // Ojo Derecho (OD)
    od_esfera: '',
    od_cilindro: '',
    od_eje: '',
    od_adicion: '',
    
    // Ojo Izquierdo (OI)
    oi_esfera: '',
    oi_cilindro: '',
    oi_eje: '',
    oi_adicion: '',
    
    // Metadatos
    fecha_examen: new Date().toISOString().split('T')[0],
    notas: ''
  })

  // Cargar datos del cliente al montar
  useEffect(() => {
    if (clienteId) {
      cargarCliente()
    }
    
    // Si hay graduación existente, cargar datos
    if (graduacionExistente) {
      setDatosGraduacion({
        tipo: graduacionExistente.tipo || 'lejos',
        od_esfera: graduacionExistente.od_esfera || '',
        od_cilindro: graduacionExistente.od_cilindro || '',
        od_eje: graduacionExistente.od_eje || '',
        od_adicion: graduacionExistente.od_adicion || '',
        oi_esfera: graduacionExistente.oi_esfera || '',
        oi_cilindro: graduacionExistente.oi_cilindro || '',
        oi_eje: graduacionExistente.oi_eje || '',
        oi_adicion: graduacionExistente.oi_adicion || '',
        fecha_examen: graduacionExistente.fecha_examen || new Date().toISOString().split('T')[0],
        notas: graduacionExistente.notas || ''
      })
      
      if (graduacionExistente.imagen_resultado) {
        setVistaPrevia(graduacionExistente.imagen_resultado)
      }
    }
  }, [clienteId, graduacionExistente])

  const cargarCliente = async () => {
    try {
      const respuesta = await fetch(`/api/clientes/${clienteId}`, {
        credentials: 'include'
      })
      
      if (respuesta.ok) {
        const datos = await respuesta.json()
        setCliente(datos.cliente)
      }
    } catch (error) {
      console.error('Error cargando cliente:', error)
    }
  }

  const manejarCambio = (evento) => {
    const { name, value } = evento.target
    
    setDatosGraduacion(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar errores del campo
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const manejarArchivoImagen = (evento) => {
    const archivo = evento.target.files[0]
    
    if (archivo) {
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png']
      if (!tiposPermitidos.includes(archivo.type)) {
        setMensaje('Solo se permiten archivos JPG, JPEG o PNG')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        setMensaje('El archivo no debe exceder 5MB')
        return
      }

      setArchivoImagen(archivo)
      
      // Crear vista previa
      const reader = new FileReader()
      reader.onload = (e) => {
        setVistaPrevia(e.target.result)
      }
      reader.readAsDataURL(archivo)
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    // Validar rangos de esfera
    if (datosGraduacion.od_esfera && (parseFloat(datosGraduacion.od_esfera) < -30 || parseFloat(datosGraduacion.od_esfera) > 30)) {
      nuevosErrores.od_esfera = 'Esfera OD debe estar entre -30.00 y +30.00'
    }
    
    if (datosGraduacion.oi_esfera && (parseFloat(datosGraduacion.oi_esfera) < -30 || parseFloat(datosGraduacion.oi_esfera) > 30)) {
      nuevosErrores.oi_esfera = 'Esfera OI debe estar entre -30.00 y +30.00'
    }

    // Validar rangos de cilindro
    if (datosGraduacion.od_cilindro && (parseFloat(datosGraduacion.od_cilindro) < -10 || parseFloat(datosGraduacion.od_cilindro) > 10)) {
      nuevosErrores.od_cilindro = 'Cilindro OD debe estar entre -10.00 y +10.00'
    }
    
    if (datosGraduacion.oi_cilindro && (parseFloat(datosGraduacion.oi_cilindro) < -10 || parseFloat(datosGraduacion.oi_cilindro) > 10)) {
      nuevosErrores.oi_cilindro = 'Cilindro OI debe estar entre -10.00 y +10.00'
    }

    // Validar eje (0-180)
    if (datosGraduacion.od_eje && (parseInt(datosGraduacion.od_eje) < 0 || parseInt(datosGraduacion.od_eje) > 180)) {
      nuevosErrores.od_eje = 'Eje OD debe estar entre 0 y 180'
    }
    
    if (datosGraduacion.oi_eje && (parseInt(datosGraduacion.oi_eje) < 0 || parseInt(datosGraduacion.oi_eje) > 180)) {
      nuevosErrores.oi_eje = 'Eje OI debe estar entre 0 y 180'
    }

    // Validar adición
    if (datosGraduacion.od_adicion && (parseFloat(datosGraduacion.od_adicion) < 0 || parseFloat(datosGraduacion.od_adicion) > 5)) {
      nuevosErrores.od_adicion = 'Adición OD debe estar entre 0.00 y +5.00'
    }
    
    if (datosGraduacion.oi_adicion && (parseFloat(datosGraduacion.oi_adicion) < 0 || parseFloat(datosGraduacion.oi_adicion) > 5)) {
      nuevosErrores.oi_adicion = 'Adición OI debe estar entre 0.00 y +5.00'
    }

    // Si hay cilindro, debe haber eje
    if (datosGraduacion.od_cilindro && parseFloat(datosGraduacion.od_cilindro) !== 0 && !datosGraduacion.od_eje) {
      nuevosErrores.od_eje = 'Eje requerido cuando hay cilindro'
    }
    
    if (datosGraduacion.oi_cilindro && parseFloat(datosGraduacion.oi_cilindro) !== 0 && !datosGraduacion.oi_eje) {
      nuevosErrores.oi_eje = 'Eje requerido cuando hay cilindro'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarSubmit = async (evento) => {
    evento.preventDefault()
    setMensaje('')

    if (!validarFormulario()) {
      return
    }

    setCargando(true)

    try {
      let rutaImagen = ''

      // Subir imagen si hay una
      if (archivoImagen) {
        const formData = new FormData()
        formData.append('archivo', archivoImagen)
        formData.append('tipo', 'graduacion')

        const respuestaArchivo = await fetch('/api/archivos/subir', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (respuestaArchivo.ok) {
          const datosArchivo = await respuestaArchivo.json()
          rutaImagen = datosArchivo.ruta
        }
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        ...datosGraduacion,
        cliente_id: clienteId,
        imagen_resultado: rutaImagen || vistaPrevia || null
      }

      // Determinar URL y método
      const url = graduacionExistente 
        ? `/api/graduaciones/${graduacionExistente.id}` 
        : '/api/graduaciones'
      const metodo = graduacionExistente ? 'PUT' : 'POST'

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(datosParaEnviar)
      })

      const datos = await respuesta.json()

      if (respuesta.ok) {
        setMensaje(graduacionExistente ? 'Graduación actualizada exitosamente' : 'Graduación registrada exitosamente')
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push(`/clientes/${clienteId}`)
        }, 2000)
      } else {
        setMensaje(`Error: ${datos.error}`)
      }
    } catch (error) {
      setMensaje('Error de conexión. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const limpiarFormulario = () => {
    setDatosGraduacion({
      tipo: 'lejos',
      od_esfera: '',
      od_cilindro: '',
      od_eje: '',
      od_adicion: '',
      oi_esfera: '',
      oi_cilindro: '',
      oi_eje: '',
      oi_adicion: '',
      fecha_examen: new Date().toISOString().split('T')[0],
      notas: ''
    })
    setArchivoImagen(null)
    setVistaPrevia('')
    setErrores({})
    setMensaje('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar simple */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl">👓</span>
                <h1 className="ml-2 text-xl font-bold text-gray-900">Sistema Óptica</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/clientes" className="text-blue-600 font-medium">
                👥 Clientes
              </Link>
              <Link href="/ventas" className="text-gray-600 hover:text-gray-900">
                🛒 Ventas
              </Link>
              <Link href="/reportes" className="text-gray-600 hover:text-gray-900">
                📊 Reportes
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {graduacionExistente ? 'Editar Graduación' : 'Nueva Graduación'}
                </h2>
                {cliente && (
                  <p className="text-gray-600 mt-1">
                    Cliente: <span className="font-medium">{cliente.nombre_completo}</span>
                    {cliente.expediente && <span className="text-sm"> (Exp: {cliente.expediente})</span>}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <select
                  name="tipo"
                  value={datosGraduacion.tipo}
                  onChange={manejarCambio}
                  className="form-input text-sm"
                >
                  <option value="lejos">Graduación de Lejos</option>
                  <option value="cerca">Graduación de Cerca</option>
                </select>
              </div>
            </div>
          </div>

          {mensaje && (
            <div className={`mx-6 mt-4 p-4 rounded-md ${
              mensaje.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {mensaje}
            </div>
          )}

          <form onSubmit={manejarSubmit} className="p-6 space-y-6">
            {/* Información del Examen */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Examen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha del Examen
                  </label>
                  <input
                    type="date"
                    name="fecha_examen"
                    value={datosGraduacion.fecha_examen}
                    onChange={manejarCambio}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Graduación
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tipo"
                        value="lejos"
                        checked={datosGraduacion.tipo === 'lejos'}
                        onChange={manejarCambio}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">Lejos</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tipo"
                        value="cerca"
                        checked={datosGraduacion.tipo === 'cerca'}
                        onChange={manejarCambio}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">Cerca</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Graduación por Ojos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mediciones Ópticas
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ojo Derecho */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="mr-2">👁️</span>
                    Ojo Derecho (OD)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Esfera
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        name="od_esfera"
                        value={datosGraduacion.od_esfera}
                        onChange={manejarCambio}
                        className={`form-input text-sm ${errores.od_esfera ? 'border-red-300' : ''}`}
                        placeholder="+/-0.00"
                      />
                      {errores.od_esfera && (
                        <p className="text-red-600 text-xs mt-1">{errores.od_esfera}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cilindro
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        name="od_cilindro"
                        value={datosGraduacion.od_cilindro}
                        onChange={manejarCambio}
                        className={`form-input text-sm ${errores.od_cilindro ? 'border-red-300' : ''}`}
                        placeholder="+/-0.00"
                      />
                      {errores.od_cilindro && (
                        <p className="text-red-600 text-xs mt-1">{errores.od_cilindro}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Eje
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        name="od_eje"
                        value={datosGraduacion.od_eje}
                        onChange={manejarCambio}
                        className={`form-input text-sm ${errores.od_eje ? 'border-red-300' : ''}`}
                        placeholder="0-180°"
                      />
                      {errores.od_eje && (
                        <p className="text-red-600 text-xs mt-1">{errores.od_eje}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Adición
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        name="od_adicion"
                        value={datosGraduacion.od_adicion}
                        onChange={manejarCambio}
                        className={`form-input text-sm ${errores.od_adicion ? 'border-red-300' : ''}`}
                        placeholder="+0.00"
                      />
                      {errores.od_adicion && (
                        <p className="text-red-600 text-xs mt-1">{errores.od_adicion}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ojo Izquierdo */}
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <span className="mr-2">👁️</span>
                    Ojo Izquierdo (OI)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Esfera
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        name="oi_esfera"
                        value={datosGraduacion.oi_esfera}
                        onChange={manejarCambio}
                        className={`form-input text-sm ${errores.oi_esfera ? 'border-red-300' : ''}`}
                        placeholder="+/-0.00"
                      />
                      {errores.oi_esfera && (
                        <p className="text-red-600 text-xs mt-1">{errores.oi_esfera}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cilindro
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        name="oi_cilindro"
                        value={datosGraduacion.oi_cilindro}
                        onChange={manejarCambio}
                        className={`form-input text-sm ${errores.oi_cilindro ? 'border-red-300' : ''}`}
                        placeholder="+/-0.00"
                      />
                      {errores.oi_cilindro && (
                        <p className="text-red-600 text-xs mt-1">{errores.oi_cilindro}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Eje
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        name="oi_eje"
                        value={datosGraduacion.oi_eje}
                        onChange={manejarCambio}
                        className={`form-input text-sm ${errores.oi_eje ? 'border-red-300' : ''}`}
                        placeholder="0-180°"
                      />
                      {errores.oi_eje && (
                        <p className="text-red-600 text-xs mt-1">{errores.oi_eje}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Adición
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        name="oi_adicion"
                        value={datosGraduacion.oi_adicion}
                        onChange={manejarCambio}
                        className={`form-input text-sm ${errores.oi_adicion ? 'border-red-300' : ''}`}
                        placeholder="+0.00"
                      />
                      {errores.oi_adicion && (
                        <p className="text-red-600 text-xs mt-1">{errores.oi_adicion}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Imagen de Resultados */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Imagen de Resultados (Opcional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir imagen del autorefractómetro
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={manejarArchivoImagen}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos permitidos: JPG, JPEG, PNG (máximo 5MB)
                  </p>
                </div>
                
                {vistaPrevia && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vista previa
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <img
                        src={vistaPrevia}
                        alt="Vista previa"
                        className="max-w-full h-32 object-contain mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVistaPrevia('')
                          setArchivoImagen(null)
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Eliminar imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas y Observaciones
              </label>
              <textarea
                name="notas"
                value={datosGraduacion.notas}
                onChange={manejarCambio}
                rows="3"
                className="form-input resize-vertical"
                placeholder="Observaciones adicionales sobre el examen..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/clientes/${clienteId}`)}
                  className="btn btn-secondary"
                  disabled={cargando}
                >
                  Cancelar
                </button>
                
                {!graduacionExistente && (
                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="btn btn-secondary"
                    disabled={cargando}
                  >
                    Limpiar Formulario
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={cargando}
                className={`btn btn-primary ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {cargando ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    {graduacionExistente ? 'Actualizando...' : 'Guardando...'}
                  </div>
                ) : (
                  graduacionExistente ? 'Actualizar Graduación' : 'Guardar Graduación'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}