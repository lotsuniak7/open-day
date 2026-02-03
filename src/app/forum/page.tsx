"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, ExternalLink } from "lucide-react";

// ---------------------------------------------------------------------------
// types
// ---------------------------------------------------------------------------
interface StudentPageMeta {
    id: string;
    name: string;
    bgImage?: string;
    createdAt: string;
    /** first hero/glitch title pulled server-side for the card preview */
    previewTitle?: string;
    /** dominant bg from the hero section – used for card colour */
    previewBg?: string;
    /** dominant text colour from the hero section */
    previewColor?: string;
    /** tag derived from sections present (e.g. "Code", "Design", "Video") */
    tag?: string;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function deriveTag(page: StudentPageMeta): string {
    // server already sends this; keep fallback for safety
    return page.tag || "Portfolio";
}

// ---------------------------------------------------------------------------
// components
// ---------------------------------------------------------------------------

/** Single gallery card – pure presentational */
function StudentCard({ page }: { page: StudentPageMeta }) {
    const bg = page.previewBg || "#0f172a";
    const color = page.previewColor || "#f1f5f9";
    const title = page.previewTitle || page.name;
    const tag = deriveTag(page);

    return (
        <Link
            href={`/view/${page.id}`}
            className="group relative block rounded-2xl overflow-hidden shadow-md
                 hover:shadow-xl transition-shadow duration-300"
            style={{ aspectRatio: "4 / 3" }}
        >
            {/* base card */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center
                   text-center px-6 transition-transform duration-500
                   group-hover:scale-105"
                style={{ backgroundColor: bg, color }}
            >
                <h3
                    className="text-xl sm:text-2xl font-black uppercase tracking-tighter
                     leading-none mb-2 truncate w-full text-center"
                >
                    {title}
                </h3>
                <div className="h-0.5 w-8 rounded-full opacity-40 mb-3" style={{ backgroundColor: color }} />
                <p className="font-mono text-[11px] opacity-60 truncate w-full text-center">
                    {page.name}
                </p>
            </div>

            {/* hover overlay */}
            <div
                className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center
                   text-white px-6 text-center
                   opacity-0 group-hover:opacity-100 transition-opacity duration-250"
            >
        <span
            className="inline-block bg-white/15 backdrop-blur px-3 py-1 rounded-full
                     text-[10px] font-bold uppercase tracking-widest mb-4"
        >
          {tag}
        </span>
                <p className="text-base font-bold leading-tight mb-1">{page.name}</p>
                <p className="text-xs opacity-50 mb-5 font-mono">
                    {new Date(page.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </p>
                <span className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
          Voir la page <ArrowRight size={14} />
        </span>
            </div>
        </Link>
    );
}

/** Skeleton shown while data loads */
function SkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl bg-slate-800/40 animate-pulse"
                    style={{ aspectRatio: "4 / 3" }}
                />
            ))}
        </div>
    );
}

/** Empty state when zero page exist yet */
function EmptyState() {
    return (
        <div className="col-span-full py-24 text-center text-slate-500">
            <p className="text-lg font-semibold mb-1">Aucune page pour le moment</p>
            <p className="text-sm font-mono opacity-60">
                Les pages des étudiants apparaîtront ici après la création.
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// page
// ---------------------------------------------------------------------------
export default function ForumPage() {
    const [pages, setPages] = useState<StudentPageMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    // fetch once on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/pages");
                if (!res.ok) throw new Error("fetch failed");
                const data: StudentPageMeta[] = await res.json();
                setPages(data);
            } catch {
                console.error("Failed to load page");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // client-side filter – searches name + previewTitle
    const filtered = useMemo(() => {
        if (!query.trim()) return pages;
        const q = query.toLowerCase();
        return pages.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.previewTitle || "").toLowerCase().includes(q) ||
                (p.tag || "").toLowerCase().includes(q)
        );
    }, [pages, query]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            {/* --------------------------------------------------------- header */}
            <header className="border-b border-slate-800 sticky top-0 z-30 bg-slate-950/90 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
                    {/* logo / branding */}
                    <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-tight">
              IUT Dijon
            </span>
                        <span className="text-slate-700">|</span>
                        <span className="text-sm font-black tracking-tight text-white">
              MMI <span className="text-blue-500">·</span> OPEN DAY
            </span>
                    </div>

                    {/* search – wired */}
                    <div className="relative flex-1 max-w-xs">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
                            size={15}
                        />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Chercher un étudiant…"
                            className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800
                         rounded-lg text-sm text-slate-200 placeholder-slate-600
                         outline-none focus:border-blue-600 transition-colors"
                        />
                    </div>

                    {/* page count badge */}
                    {!loading && (
                        <span className="text-[11px] font-mono text-slate-600 shrink-0">
              {filtered.length} page{filtered.length !== 1 ? "s" : ""}
            </span>
                    )}
                </div>
            </header>

            {/* --------------------------------------------------------- hero */}
            <section className="relative overflow-hidden">
                {/* subtle grid texture – no external dep */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                <div className="relative z-10 max-w-6xl mx-auto px-5 py-16 sm:py-24">
                    {/* eyebrow */}
                    <p className="font-mono text-[11px] uppercase tracking-widest text-blue-500 mb-4">
                        Journée Portes Ouvertes — 2025
                    </p>
                    {/* title */}
                    <h1 className="text-4xl sm:text-6xl font-black leading-none tracking-tight text-white mb-4">
                        Les Talents
                        <br />
                        <span className="text-slate-600">de Demain</span>
                    </h1>
                    {/* sub */}
                    <p className="text-slate-500 max-w-md text-base leading-relaxed">
                        Parcourez les sites créés par les étudiants MMI. Chaque page — une vision, une stack, un style.
                    </p>
                </div>
            </section>

            {/* --------------------------------------------------------- gallery */}
            <main className="max-w-6xl mx-auto px-5 pb-24">
                {loading ? (
                    <SkeletonGrid />
                ) : filtered.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((page) => (
                            <StudentCard key={page.id} page={page} />
                        ))}
                    </div>
                )}
            </main>

            {/* --------------------------------------------------------- footer */}
            <footer className="border-t border-slate-800 py-8">
                <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 text-[11px] font-mono">
                    <span>© 2025 IUT Dijon — Département MMI</span>
                    <span className="flex items-center gap-1 opacity-50">
            Open Day Builder <ExternalLink size={10} />
          </span>
                </div>
            </footer>
        </div>
    );
}