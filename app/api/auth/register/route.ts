import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

// Esquema de validación para registro
const registerSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  language: z.string().min(1, "Selecciona un idioma"),
  age: z.string().min(1, "Selecciona tu edad"),
  education: z.string().min(1, "Selecciona tu nivel educativo"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = registerSchema.parse(body)
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        language: validatedData.language,
        role: "STUDENT",
        // Guardar preferencias adicionales en JSON
        accessibilityPreferences: {
          age: validatedData.age,
          education: validatedData.education,
        }
      }
    })
    
    // Crear perfil de estudiante asociado
    await prisma.student.create({
      data: {
        name: user.name!,
        age: parseInt(validatedData.age.split('-')[0]), // Tomar el primer número del rango
        language: validatedData.language,
        userId: user.id,
      }
    })
    
    return NextResponse.json(
      { 
        message: "Usuario registrado exitosamente",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error("Error en registro:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
