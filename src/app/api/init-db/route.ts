import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS student_pages (
        id SERIAL PRIMARY KEY,
        name TEXT,
        content TEXT,
        bg_image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        return NextResponse.json({ message: "Table est bien faite (Neon/Postgres)!" });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
