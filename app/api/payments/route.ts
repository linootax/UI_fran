import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    const client = await clientPromise
    const db = client.db("school_management")

    const query: any = {}

    if (studentId) {
      query.studentId = studentId
    }

    const payments = await db.collection("payments").find(query).sort({ date: -1 }).toArray()

    return NextResponse.json(payments)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al obtener los pagos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("school_management")

    const data = await request.json()

    // Validación básica
    if (!data.studentId || !data.amount || !data.concept) {
      return NextResponse.json({ error: "Alumno, monto y concepto son campos requeridos" }, { status: 400 })
    }

    // Generar número de recibo si es un pago completado
    let receiptNumber = null
    if (data.status === "Pagado") {
      // Generar un número de recibo único basado en la fecha y un contador
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")

      // Obtener el último recibo para generar un número secuencial
      const lastPayment = await db
        .collection("payments")
        .find({ status: "Pagado" })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray()

      const counter =
        lastPayment.length > 0 && lastPayment[0].receiptNumber
          ? Number.parseInt(lastPayment[0].receiptNumber.split("-")[2]) + 1
          : 1

      receiptNumber = `REC-${year}${month}-${String(counter).padStart(3, "0")}`
    }

    const result = await db.collection("payments").insertOne({
      ...data,
      date: data.date || new Date().toISOString().split("T")[0],
      receiptNumber,
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        receiptNumber,
      },
      { status: 201 },
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al registrar el pago" }, { status: 500 })
  }
}

