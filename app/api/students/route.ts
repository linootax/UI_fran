import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("school_management")

    const students = await db.collection("students").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(students)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al obtener los alumnos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("school_management")

    const data = await request.json()

    // Validación básica
    if (!data.name || !data.grade) {
      return NextResponse.json({ error: "Nombre y grado son campos requeridos" }, { status: 400 })
    }

    const result = await db.collection("students").insertOne({
      ...data,
      status: data.status || "Activo",
      enrollmentDate: data.enrollmentDate || new Date().toISOString().split("T")[0],
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al crear el alumno" }, { status: 500 })
  }
}

