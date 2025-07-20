import { NextResponse } from "next/server";
import { extractRutFromDocumentFields, extractRutFromText, validateRut, cleanOcrText } from "@/lib/rut-utils";

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  console.error("Missing OpenAI API key. Please set OPENAI_API_KEY in your environment variables.")
  throw new Error("OpenAI API key is required")
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No se proporcionó texto OCR" }, { status: 400 })
    }

    console.log("Texto OCR completo:", text)

    console.log("Procesando texto OCR...");

    // Aquí implementarías la lógica de procesamiento de OCR utilizando Scandit
    // Por ejemplo, podrías utilizar funciones de Scandit para procesar el texto

    return NextResponse.json({ success: true, data: "Datos procesados" });
  } catch (error) {
    console.error("Error procesando OCR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
