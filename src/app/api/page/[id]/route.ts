import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // SQL запрос: найти по ID
        const result = await sql`
      SELECT * FROM student_pages WHERE id = ${id} LIMIT 1;
    `;

        const page = result.rows[0];

        if (!page) {
            return NextResponse.json({ error: "Page introuvable" }, { status: 404 });
        }

        return NextResponse.json({
            sections: JSON.parse(page.content),
            bgImage: page.bg_image, // В базе это bg_image (с подчеркиванием)
            name: page.name,
            createdAt: page.created_at
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}