import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> } // Next.js 15: params это Promise
) {
    try {
        const { id } = await params; // 1. Достаем ID (это строка, например "1")

        // 2. Превращаем строку в число, так как в базе теперь Int
        const pageId = parseInt(id);

        if (isNaN(pageId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const page = await prisma.studentPage.findUnique({
            where: { id: pageId }, // Ищем по числу
        });

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        return NextResponse.json({
            sections: JSON.parse(page.content),
            bgImage: page.bgImage || null,
            name: page.name,
            createdAt: page.createdAt,
        });
    } catch (error) {
        console.error("GET /api/page/[id] →", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}