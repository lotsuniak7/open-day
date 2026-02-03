import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Вспомогательные функции (оставляем как были)
interface Section { type: string; content: Record<string, any>; styles?: { bg?: string; color?: string }; }

function extractPreview(sections: Section[]) {
    const hero = sections.find((s) => s.type === "hero" || s.type === "glitch");
    const source = hero || sections[0];
    return {
        previewTitle: source?.content?.title || null,
        previewBg: source?.styles?.bg || null,
        previewColor: source?.styles?.color || null,
    };
}

function deriveTag(sections: Section[]): string {
    const types = new Set(sections.map((s) => s.type));
    if (types.has("code")) return "Code";
    if (types.has("terminal")) return "Terminal";
    if (types.has("video")) return "Video";
    if (types.has("project")) return "Projet";
    if (types.has("glitch")) return "Hacker";
    return "Portfolio";
}

export async function GET() {
    try {
        // Получаем все страницы, сортируем: новые сверху
        const result = await sql`
      SELECT * FROM student_pages ORDER BY created_at DESC;
    `;

        const pages = result.rows.map((row) => {
            let sections: Section[] = [];
            try { sections = JSON.parse(row.content); } catch {}

            const { previewTitle, previewBg, previewColor } = extractPreview(sections);

            return {
                id: row.id,
                name: row.name,
                bgImage: row.bg_image,
                createdAt: row.created_at,
                previewTitle,
                previewBg,
                previewColor,
                tag: deriveTag(sections),
            };
        });

        return NextResponse.json(pages);
    } catch (error) {
        console.error("Forum Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}