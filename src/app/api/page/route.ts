import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sections, bgImage, studentFirstName, studentLastName } = body;

        // 1. Формируем имя студента
        let studentName = "Anonyme";
        if (studentFirstName || studentLastName) {
            studentName = `${studentFirstName || ""} ${studentLastName || ""}`.trim();
        } else {
            // Пытаемся найти имя в блоках Hero или Glitch
            const heroBlock = sections.find((s: any) => s.type === 'hero' || s.type === 'glitch');
            if (heroBlock?.content?.title) studentName = heroBlock.content.title;
        }

        // 2. Вставляем данные в базу
        // ВАЖНО: Мы используем JSON.stringify для sections, так как в базе это текстовое поле
        const result = await sql`
      INSERT INTO student_pages (name, content, bg_image)
      VALUES (${studentName}, ${JSON.stringify(sections)}, ${bgImage || ""})
      RETURNING id;
    `;

        // 3. Получаем ID новой записи
        const newId = result.rows[0].id;

        return NextResponse.json({ success: true, id: newId });

    } catch (error) {
        console.error("ОШИБКА СОХРАНЕНИЯ:", error);
        // Возвращаем текст ошибки, чтобы видеть её в консоли браузера
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}