import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { language: string } }
) {
  try {
    const { language } = params
    
    // Construir la ruta al archivo de traducciones
    const filePath = path.join(process.cwd(), 'locales', language, 'common.json')
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Translation file not found for language: ${language}` },
        { status: 404 }
      )
    }
    
    // Leer el archivo
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const translations = JSON.parse(fileContent)
    
    // Devolver las traducciones con headers apropiados
    return NextResponse.json(translations, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    })
    
  } catch (error) {
    console.error('Error loading translations:', error)
    return NextResponse.json(
      { error: 'Failed to load translations' },
      { status: 500 }
    )
  }
}
