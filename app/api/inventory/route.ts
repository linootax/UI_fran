import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const client = await clientPromise
    const db = client.db("school_management")

    const query: any = {}

    if (category && category !== "all") {
      query.category = category
    }

    const inventory = await db.collection("inventory").find(query).sort({ name: 1 }).toArray()

    return NextResponse.json(inventory)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al obtener el inventario" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("school_management")

    const data = await request.json()

    // Validación básica
    if (!data.name || !data.category || data.quantity === undefined) {
      return NextResponse.json({ error: "Nombre, categoría y cantidad son campos requeridos" }, { status: 400 })
    }

    // Determinar el estado basado en la cantidad
    let status = "Disponible"
    if (data.quantity <= 0) {
      status = "Agotado"
    } else if (data.quantity <= 10) {
      status = "Bajo stock"
    }

    const result = await db.collection("inventory").insertOne({
      ...data,
      status,
      lastUpdated: new Date().toISOString().split("T")[0],
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
    return NextResponse.json({ error: "Error al agregar el item al inventario" }, { status: 500 })
  }
}

