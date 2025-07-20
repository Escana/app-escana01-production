"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, StopCircle, CheckCircle, AlertCircle } from 'lucide-react'

interface ScanditScannerProps {
  onScanResult: (data: any) => void
  onError: (error: string) => void
}

interface ScanResult {
  rut: string | null
  nombres: string | null
  apellidos: string | null
  nacionalidad: string | null
  sexo: string | null
  fechaNacimiento: string | null
  edad: number | null
}

export function ScanditScanner({ onScanResult, onError }: ScanditScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanditEngine, setScanditEngine] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null)

  // Inicializar Scandit SDK
  useEffect(() => {
    const initializeScandit = async () => {
      try {
        // Aquí deberías cargar el SDK de Scandit
        // Este es un ejemplo de cómo sería la integración
        
        // const ScanditSDK = await import('@scandit/web-datacapture-core')
        // const scanditEngine = await ScanditSDK.configure({
        //   licenseKey: process.env.NEXT_PUBLIC_SCANDIT_LICENSE_KEY,
        //   libraryLocation: '/scandit-sdk/'
        // })
        
        console.log('Scandit SDK inicializado (simulado)')
        // setScanditEngine(scanditEngine)
        
      } catch (error) {
        console.error('Error inicializando Scandit:', error)
        onError('Error al inicializar el escáner')
      }
    }

    initializeScandit()
  }, [onError])

  const startScanning = async () => {
    if (!scannerRef.current) return

    setIsScanning(true)
    setIsLoading(true)

    try {
      // Simulación de escaneo con Scandit
      // En la implementación real, aquí configurarías el escáner de Scandit
      
      console.log('Iniciando escaneo con Scandit...')
      
      // Simulación de datos que Scandit podría devolver
      setTimeout(() => {
        const mockScanditData = {
          documentNumber: "12345678", // Aquí estaría el número que Scandit detecta
          firstName: "JUAN CARLOS",
          lastName: "PEREZ GONZALEZ", 
          nationality: "CHILENA",
          sex: "M",
          dateOfBirth: "1990-01-15",
          // Nota: Scandit NO devuelve el RUT formateado, solo el número
        }

        processScanResult(mockScanditData)
      }, 2000)

    } catch (error) {
      console.error('Error durante el escaneo:', error)
      onError('Error durante el escaneo')
      setIsScanning(false)
      setIsLoading(false)
    }
  }

  const processScanResult = async (scanditData: any) => {
    setIsLoading(true)

    try {
      console.log('Procesando resultado de Scandit:', scanditData)

      // Enviar datos a nuestro endpoint híbrido
      const response = await fetch('/api/ocr-scandit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanditData: scanditData,
          fallbackText: null // Solo usar Scandit por ahora
        }),
      })

      if (!response.ok) {
        throw new Error('Error en el procesamiento')
      }

      const result = await response.json()
      console.log('Resultado procesado:', result)

      if (result.success) {
        setLastScanResult(result.data)
        onScanResult(result)
      } else {
        onError('No se pudieron extraer los datos del documento')
      }

    } catch (error) {
      console.error('Error procesando resultado:', error)
      onError('Error al procesar el documento escaneado')
    } finally {
      setIsScanning(false)
      setIsLoading(false)
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    setIsLoading(false)
    // Aquí detendrías el escáner de Scandit
    console.log('Escaneo detenido')
  }

  return (
    <div className="space-y-4">
      {/* Área del escáner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Escáner de Documentos (Scandit)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={scannerRef}
            className="relative w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
          >
            {!isScanning ? (
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Presiona "Iniciar Escaneo" para comenzar</p>
              </div>
            ) : (
              <div className="text-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-blue-600">Procesando documento...</p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-green-600">Escaneando... Coloca el documento</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Iniciar Escaneo
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive" className="flex-1">
                <StopCircle className="w-4 h-4 mr-2" />
                Detener Escaneo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado del último escaneo */}
      {lastScanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Último Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">RUT:</span>
                <p className={`${lastScanResult.rut ? 'text-green-600' : 'text-red-500'}`}>
                  {lastScanResult.rut || 'No detectado'}
                </p>
              </div>
              <div>
                <span className="font-medium">Nombres:</span>
                <p>{lastScanResult.nombres || 'No detectado'}</p>
              </div>
              <div>
                <span className="font-medium">Apellidos:</span>
                <p>{lastScanResult.apellidos || 'No detectado'}</p>
              </div>
              <div>
                <span className="font-medium">Nacionalidad:</span>
                <p>{lastScanResult.nacionalidad || 'No detectado'}</p>
              </div>
              <div>
                <span className="font-medium">Sexo:</span>
                <p>{lastScanResult.sexo || 'No detectado'}</p>
              </div>
              <div>
                <span className="font-medium">Fecha Nacimiento:</span>
                <p>{lastScanResult.fechaNacimiento || 'No detectado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Instrucciones:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Coloca la cédula de identidad frente a la cámara</li>
                <li>Asegúrate de que esté bien iluminada y enfocada</li>
                <li>El sistema extraerá automáticamente el RUT y otros datos</li>
                <li>Si el RUT no se detecta correctamente, se usará OpenAI como respaldo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
