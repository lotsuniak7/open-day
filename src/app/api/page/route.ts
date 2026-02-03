import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sections, bgImage, studentFirstName, studentLastName, orientation } = body;

        if (!Array.isArray(sections) || sections.length === 0) {
            return NextResponse.json(
                { success: false, error: "sections must be a non-empty array" },
                { status: 400 }
            );
        }

        // имя: явные поля из модального окна > title из hero блока > fallback
        let studentName = "Anonyme";
        if (studentFirstName && studentLastName) {
            studentName = `${studentFirstName} ${studentLastName}`;
        } else {
            const heroBlock = sections.find(
                (s: any) => s.type === "hero" || s.type === "glitch"
            );
            if (heroBlock?.content?.title) studentName = heroBlock.content.title;
        }

        const newPage = await prisma.studentPage.create({
            data: {
                name: studentName,
                bgImage: typeof bgImage === "string" ? bgImage : "",
                content: JSON.stringify(sections),
                orientation: orientation || "",
            },
        });

        return NextResponse.json({ success: true, id: newPage.id });
    } catch (error) {
        console.error("POST /api/page →", error);
        return NextResponse.json(
            { success: false, error: "Database error" },
            { status: 500 }
        );
    }
}