import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

interface AttendanceRecord {
  _id?: ObjectId;
  studentId: string;
  date: string;
  status: "Presente" | "Ausente" | "Retardo";
  notes?: string;
  createdAt?: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const client = await clientPromise;
    const db = client.db("school_management");

    const query: Partial<AttendanceRecord> = {};

    if (date) {
      query.date = date;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    // Add date range query if provided
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      } as any;
    }

    const attendance = await db
      .collection<AttendanceRecord>("attendance")
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(attendance);
  } catch (e) {
    console.error("Error fetching attendance:", e);
    return NextResponse.json(
      { error: "Error al obtener las asistencias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("school_management");

    const data = await request.json();

    // Validate required fields
    if (!data.studentId || !data.date || !data.status) {
      return NextResponse.json(
        { error: "Alumno, fecha y estado son campos requeridos" },
        { status: 400 }
      );
    }

    // Validate status value
    if (!["Presente", "Ausente", "Retardo"].includes(data.status)) {
      return NextResponse.json(
        { error: "Estado de asistencia inválido" },
        { status: 400 }
      );
    }

    // Check for existing attendance record
    const existingRecord = await db
      .collection<AttendanceRecord>("attendance")
      .findOne({
        studentId: data.studentId,
        date: data.date,
      });

    if (existingRecord) {
      return NextResponse.json(
        {
          error:
            "Ya existe un registro de asistencia para este alumno en esta fecha",
        },
        { status: 400 }
      );
    }

    const attendanceRecord: AttendanceRecord = {
      studentId: data.studentId,
      date: data.date,
      status: data.status,
      notes: data.notes,
      createdAt: new Date(),
    };

    const result = await db
      .collection<AttendanceRecord>("attendance")
      .insertOne(attendanceRecord);

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Error creating attendance record:", e);
    return NextResponse.json(
      { error: "Error al registrar la asistencia" },
      { status: 500 }
    );
  }
}
