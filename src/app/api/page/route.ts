import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sections, bgImage, studentFirstName, studentLastName } = body;

        // 1. Пытаемся понять имя студента
        let studentName = "Anonyme";

        // Если пришли поля имени/фамилии (из модалки, если она есть)
        if (studentFirstName || studentLastName) {
            studentName = `${studentFirstName || ""} ${studentLastName || ""}`.trim();
        } else {
            // Иначе ищем в блоках (Hero или Glitch)
            const heroBlock = sections.find((s: any) => s.type === 'hero' || s.type === 'glitch');
            if (heroBlock?.content?.title) studentName = heroBlock.content.title;
        }

        // 2. Вставляем в базу (Neon Postgres)
        // RETURNING id вернет нам номер созданной страницы (1, 2, 3...)
        const result = await sql`
      INSERT INTO student_pages (name, content, bg_image)
      VALUES (${studentName}, ${JSON.stringify(sections)}, ${bgImage || ""})
      RETURNING id;
    `;

        const newId = result.rows[0].id;

        return NextResponse.json({ success: true, id: newId });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ success: false, error: "Erreur sauvegarde" }, { status: 500 });
    }
}