import { NextResponse } from "next/server"
// Temporarily disabled for deployment
// import { DataCaptureContext, Camera, configure, BarcodeCapture, BarcodeCaptureSettings } from "@scandit/web-datacapture-core";
// import { barcodeCaptureLoader } from "@scandit/web-datacapture-barcode";
import { 
  extractRutFromDocumentFields, 
  extractRutFromText, 
  validateRut, 
  cleanOcrText 
} from "@/lib/rut-utils"

// Temporarily disabled for deployment
// const scanditLicenseKey = process.env.SCANDIT_LICENSE_KEY;

// configure({
//   licenseKey: scanditLicenseKey,
//   libraryLocation: '/path/to/scandit-datacapture-sdk', // Update with actual path
// });

export async function POST(req: Request) {
  // Temporarily disabled for deployment - return fallback response
  return NextResponse.json({
    success: false,
    message: "OCR Scandit temporalmente deshabilitado para deploy",
    data: {
      rut: null,
      extractedText: "Función temporalmente deshabilitada",
      completeness: 0
    }
  }, { status: 200 });

  /* Temporarily commented out
  try {
    const { scanditData, fallbackText } = await req.json()

    console.log("Procesando datos de Scandit...")

    // Configurar el contexto de captura de datos de Scandit
    const context = DataCaptureContext.forLicenseKey(scanditLicenseKey);
    const camera = Camera.default;
    context.setFrameSource(camera);

    const settings = new BarcodeCaptureSettings();
    settings.enableSymbologies(["ean13", "upca", "code128"]);

    const barcodeCapture = BarcodeCapture.forContext(context, settings);

    // Iniciar la cámara
    await camera.switchToDesiredState(Camera.State.On);

    // Paso 1: Intentar extraer RUT de los datos de Scandit
    let extractedRut = null;
    let extractedData = {
      rut: null,
      nombres: null,
      apellidos: null,
      nacionalidad: null,
      sexo: null,
      fechaNacimiento: null,
      edad: null
    };

    if (scanditData) {
      console.log("Datos de Scandit recibidos:", scanditData);
      
      // Extraer RUT usando nuestro algoritmo inteligente
      extractedRut = extractRutFromDocumentFields(scanditData);
      
      if (extractedRut) {
        console.log("RUT extraído exitosamente:", extractedRut);
        extractedData.rut = extractedRut;
      } else {
        console.log("No se pudo extraer RUT de los datos de Scandit");
      }

      // Extraer otros campos disponibles de Scandit
      extractedData.nombres = scanditData.firstName || scanditData.given_names || null
      extractedData.apellidos = scanditData.lastName || scanditData.surnames || null
      extractedData.nacionalidad = scanditData.nationality || scanditData.nacionalidad || null
      extractedData.sexo = scanditData.sex || scanditData.gender || null
      extractedData.fechaNacimiento = scanditData.dateOfBirth || scanditData.birth_date || null

      // Calcular edad si tenemos fecha de nacimiento
      if (extractedData.fechaNacimiento) {
        const birthDate = new Date(extractedData.fechaNacimiento)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        extractedData.edad = age
      }
    }

    // Paso 3: Validación final y respuesta
    const response = {
      success: true,
      source: 'scandit',
      data: extractedData,
      validation: {
        rutValid: extractedData.rut ? validateRut(extractedData.rut) : false,
        completeness: calculateCompleteness(extractedData)
      }
    }

    console.log("Datos finales extraídos:", response)
    return NextResponse.json(response)

  } catch (error) {
    console.error("Error procesando datos de Scandit:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Función auxiliar para calcular completitud de datos
function calculateCompleteness(data: any): number {
  const requiredFields = ['rut', 'nombres', 'apellidos', 'nacionalidad', 'sexo', 'fechaNacimiento']
  const completedFields = requiredFields.filter(field => data[field] && data[field] !== null)
  return Math.round((completedFields.length / requiredFields.length) * 100)
}
