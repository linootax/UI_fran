import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const studentId = searchParams.get("studentId")

    const client = await clientPromise
    const db = client.db("school_management")

    const query: any = {}

    if (date) {
      query.date = date
    }

    if (studentId) {
      query.studentId = studentId
    }

    const attendance = await db.collection("attendance").find(query).sort({ date: -1 }).toArray()

    return NextResponse.json(attendance)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al obtener las asistencias" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("school_management")

    const data = await request.json()

    // Validación básica
    if (!data.studentId || !data.date || !data.status) {
      return NextResponse.json({ error: "Alumno, fecha y estado son campos requeridos" }, { status: 400 })
    }

    // Verificar si ya existe un registro para este alumno en esta fecha
    const existingRecord = await db.collection("attendance").findOne({
      studentId: data.studentId,
      date: data.date,
    })

    if (existingRecord) {
      return NextResponse.json(
        { error: "Ya existe un registro de asistencia para este alumno en esta fecha" },
        { status: 400 },
      )
    }

    const result = await db.collection("attendance").insertOne({
      ...data,
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
    return NextResponse.json({ error: "Error al registrar la asistencia" }, { status: 500 })
  }
}

