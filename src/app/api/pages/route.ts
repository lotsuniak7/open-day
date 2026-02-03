import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

interface Section {
    type: string;
    content: Record<string, any>;
    styles?: { bg?: string; color?: string };
}

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
    if (types.has("skills")) return "Skills";
    if (types.has("glitch")) return "Hacker";
    return "Portfolio";
}

export async function GET() {
    try {
        const rows = await prisma.studentPage.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, bgImage: true, content: true, createdAt: true },
        });

        const pages = rows.map((row) => {
            let sections: Section[] = [];
            try { sections = JSON.parse(row.content); } catch {}

            const { previewTitle, previewBg, previewColor } = extractPreview(sections);

            return {
                id: row.id,
                name: row.name,
                bgImage: row.bgImage,
                createdAt: row.createdAt,
                previewTitle,
                previewBg,
                previewColor,
                tag: deriveTag(sections),
            };
        });

        return NextResponse.json(pages);
    } catch (error) {
        console.error("GET /api/pages →", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}