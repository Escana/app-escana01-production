/**
 * Utilidades para manejo de RUT chileno
 */

// Función para calcular dígito verificador
export function calculateRutDV(rut: string): string {
  const cleanRut = rut.replace(/[^0-9]/g, '')
  let sum = 0
  let multiplier = 2

  for (let i = cleanRut.length - 1; i >= 0; i--) {
    sum += parseInt(cleanRut[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = sum % 11
  const dv = 11 - remainder

  if (dv === 11) return '0'
  if (dv === 10) return 'K'
  return dv.toString()
}

// Función para validar RUT
export function validateRut(rut: string): boolean {
  if (!rut) return false
  
  const cleanRut = rut.replace(/[^0-9K]/gi, '').toUpperCase()
  if (cleanRut.length < 2) return false

  const rutNumber = cleanRut.slice(0, -1)
  const providedDV = cleanRut.slice(-1)
  const calculatedDV = calculateRutDV(rutNumber)

  return providedDV === calculatedDV
}

// Función para formatear RUT
export function formatRut(rut: string): string {
  const cleanRut = rut.replace(/[^0-9K]/gi, '').toUpperCase()
  if (cleanRut.length < 2) return rut

  const rutNumber = cleanRut.slice(0, -1)
  const dv = cleanRut.slice(-1)
  
  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return `${formattedNumber}-${dv}`
}

// Función para extraer RUT de texto usando múltiples patrones
export function extractRutFromText(text: string): string | null {
  const patterns = [
    // Patrón estándar: XX.XXX.XXX-X
    /(\d{1,2}\.\d{3}\.\d{3}-[\dK])/gi,
    // Patrón sin puntos: XXXXXXXX-X
    /(\d{7,8}-[\dK])/gi,
    // Patrón solo números y K: XXXXXXXK o XXXXXXXX
    /(\d{7,8}[\dK])/gi,
    // Patrón con espacios: XX XXX XXX-X
    /(\d{1,2}\s\d{3}\s\d{3}-[\dK])/gi,
    // Patrón mixto: números seguidos de K o dígito
    /(\d{6,8}[\s\-]?[\dK])/gi
  ]

  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) {
      for (const match of matches) {
        const cleanMatch = match.replace(/[^0-9K]/gi, '').toUpperCase()
        if (cleanMatch.length >= 7 && cleanMatch.length <= 9) {
          // Intentar validar el RUT
          const rutNumber = cleanMatch.slice(0, -1)
          const dv = cleanMatch.slice(-1)
          const fullRut = rutNumber + dv
          
          if (validateRut(fullRut)) {
            return formatRut(fullRut)
          }
          
          // Si no es válido, intentar calcular el DV correcto
          const calculatedDV = calculateRutDV(rutNumber)
          const correctedRut = rutNumber + calculatedDV
          if (validateRut(correctedRut)) {
            return formatRut(correctedRut)
          }
        }
      }
    }
  }

  return null
}

// Función para extraer RUT de campos de documento
export function extractRutFromDocumentFields(fields: any): string | null {
  const possibleFields = [
    'documentNumber',
    'document_number', 
    'numero_documento',
    'rut',
    'run',
    'identification',
    'id_number',
    'cedula'
  ]

  for (const field of possibleFields) {
    if (fields[field]) {
      const extractedRut = extractRutFromText(String(fields[field]))
      if (extractedRut) {
        return extractedRut
      }
    }
  }

  // Si no se encuentra en campos específicos, buscar en todo el texto
  const allText = Object.values(fields).join(' ')
  return extractRutFromText(allText)
}

// Función para limpiar y normalizar texto OCR
export function cleanOcrText(text: string): string {
  return text
    .replace(/[^\w\s\.\-]/g, '') // Remover caracteres especiales excepto puntos y guiones
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim()
}
