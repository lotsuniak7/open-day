"use client";

import React, { useEffect, useState, use } from "react";
import { Link2 } from "lucide-react";

// ---------------------------------------------------------------------------
// global animation styles (glitch + typing cursor)
// ---------------------------------------------------------------------------
const GLOBAL_STYLES = `
  @keyframes glitch {
    0%   { transform: translate(0) }
    20%  { transform: translate(-2px, 2px) }
    40%  { transform: translate(-2px, -2px) }
    60%  { transform: translate(2px, 2px) }
    80%  { transform: translate(2px, -2px) }
    100% { transform: translate(0) }
  }
  .glitch-effect:hover {
    animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) infinite;
    color: #00ff41;
    text-shadow: 2px 2px red;
  }
  .typing-cursor::after {
    content: '▋';
    animation: blink 1s step-end infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1 }
    50%      { opacity: 0 }
  }
`;

// ---------------------------------------------------------------------------
// types
// ---------------------------------------------------------------------------
interface Section {
    id: string;
    type: string;
    content: Record<string, any>;
    styles: { bg: string; color: string };
}

interface PageData {
    sections: Section[];
    bgImage?: string;
    name?: string;
}

// ---------------------------------------------------------------------------
// skeleton – mirrors the section card shape so the layout doesn't jump
// ---------------------------------------------------------------------------
function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center py-16 px-4 gap-6">
            {[120, 200, 100, 160].map((h, i) => (
                <div
                    key={i}
                    className="w-full max-w-4xl rounded-3xl bg-slate-800/60 animate-pulse"
                    style={{ height: `${h}px` }}
                />
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// error page
// ---------------------------------------------------------------------------
function ErrorPage({ id }: { id: string }) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <p className="font-mono text-blue-500 text-[11px] uppercase tracking-widest mb-4">
                    IUT Dijon · MMI · Open Day
                </p>
                <h1 className="text-6xl font-black text-white mb-3">404</h1>
                <p className="text-slate-500 mb-6">
                    La page <code className="text-slate-400">{id}</code> n'existe pas ou a été supprimée.
                </p>
                <a
                    href="/forum"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition"
                >
                    ← Retour au forum
                </a>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// section renderers
// ---------------------------------------------------------------------------

function HeroSection({ content }: { content: any }) {
    return (
        <div className="text-center space-y-5">
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none">
                {content.title}
            </h1>
            {content.subtitle && (
                <p className="text-xl md:text-3xl opacity-75 font-light">{content.subtitle}</p>
            )}
        </div>
    );
}

function GlitchSection({ content }: { content: any }) {
    return (
        <div className="text-center space-y-3">
            <h1 className="glitch-effect text-6xl md:text-9xl font-black uppercase tracking-tighter cursor-default leading-none">
                {content.title}
            </h1>
            {content.subtitle && (
                <p className="text-xl font-mono opacity-75 text-green-400">{content.subtitle}</p>
            )}
        </div>
    );
}

function BioSection({ content }: { content: any }) {
    return (
        <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-medium">
            {content.text}
        </p>
    );
}

function TerminalSection({ content }: { content: any }) {
    return (
        <div className="font-mono bg-black/50 p-5 rounded-xl border border-white/10 shadow-inner">
            <div className="flex gap-1.5 mb-4 opacity-50">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-green-400 whitespace-pre-wrap typing-cursor text-sm md:text-base">
                {content.text}
            </div>
        </div>
    );
}

function CodeSection({ content }: { content: any }) {
    return (
        <div className="font-mono text-sm bg-[#1e1e1e] p-5 rounded-xl border border-white/10 text-blue-300 overflow-x-auto shadow-xl">
            <pre>{content.code}</pre>
        </div>
    );
}

function ProjectSection({ content }: { content: any }) {
    return (
        <div className="grid md:grid-cols-2 gap-8 items-center">
            {content.image && (
                <div className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform duration-500">
                    <img src={content.image} alt={content.title || "Projet"} className="w-full h-full object-cover" />
                </div>
            )}
            <div>
                <h2 className="text-3xl font-bold mb-3">{content.title}</h2>
                <p className="opacity-75 text-lg leading-relaxed">{content.desc}</p>
            </div>
        </div>
    );
}

function SkillsSection({ content }: { content: any }) {
    return (
        <div className="space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40">Compétences</h3>
            {content.list.map((skill: { name: string; level: number }, i: number) => (
                <div key={i} className="flex items-center gap-4">
                    <span className="font-bold w-32 text-right text-sm">{skill.name}</span>
                    <div className="flex-1 h-2 bg-current/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-current rounded-full transition-all duration-1000"
                            style={{ width: `${skill.level}%` }}
                        />
                    </div>
                    <span className="font-mono text-xs opacity-50 w-10 text-right">{skill.level}%</span>
                </div>
            ))}
        </div>
    );
}

function VideoSection({ content }: { content: any }) {
    if (!content.url) return null;
    return (
        <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-current/30">
            <iframe src={content.url} className="w-full h-full" allowFullScreen title="Vidéo" />
        </div>
    );
}

function SocialsSection({ content }: { content: any }) {
    const links: { key: string; href: string }[] = [];

    if (content.linkedin) {
        links.push({
            key: "LinkedIn",
            href: content.linkedin.startsWith("http")
                ? content.linkedin
                : `https://linkedin.com/in/${content.linkedin}`,
        });
    }
    if (content.github) {
        links.push({
            key: "GitHub",
            href: content.github.startsWith("http")
                ? content.github
                : `https://github.com/${content.github}`,
        });
    }
    if (content.portfolio) {
        links.push({
            key: "Portfolio",
            href: content.portfolio.startsWith("http")
                ? content.portfolio
                : `https://${content.portfolio}`,
        });
    }

    if (links.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center gap-3">
            {links.map((link) => (
                <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur border border-white/20
                     hover:bg-white/20 transition font-bold uppercase text-xs
                     flex items-center gap-2"
                >
                    <Link2 size={14} /> {link.key}
                </a>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// renderer dispatch
// ---------------------------------------------------------------------------
function renderSection(section: Section) {
    switch (section.type) {
        case "hero":      return <HeroSection content={section.content} />;
        case "glitch":    return <GlitchSection content={section.content} />;
        case "bio":       return <BioSection content={section.content} />;
        case "terminal":  return <TerminalSection content={section.content} />;
        case "code":      return <CodeSection content={section.content} />;
        case "project":   return <ProjectSection content={section.content} />;
        case "skills":    return <SkillsSection content={section.content} />;
        case "video":     return <VideoSection content={section.content} />;
        case "socials":   return <SocialsSection content={section.content} />;
        default:          return null;
    }
}

// ---------------------------------------------------------------------------
// page
// ---------------------------------------------------------------------------
export default function ViewPage({ params }: { params: Promise<{ id: string }> }) {
    // 3. Unwrap the params using 'use()'
    const { id } = use(params);

    const [data, setData] = useState<any>(null); // Replace 'any' with PageData if available
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // 4. Use the unwrapped 'id' here
                const res = await fetch(`/api/page/${id}`);
                if (!res.ok) {
                    setError(true);
                    return;
                }
                setData(await res.json());
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]); // 5. Depend on 'id', not 'params.id'

    if (loading) return <LoadingSkeleton />;
    // 6. Use unwrapped 'id' for the error page prop
    if (error || !data) return <ErrorPage id={id} />;

    const { sections, bgImage } = data;

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-cover bg-center bg-fixed"
            style={{
                backgroundColor: "#cbd5e1",
                backgroundImage: bgImage ? `url(${bgImage})` : "none",
            }}
        >
            <style>{GLOBAL_STYLES}</style>

            {/* back link */}
            <div className="w-full max-w-4xl px-4 pt-4">
                <a
                    href="/forum"
                    className="text-[11px] font-mono text-slate-500 hover:text-blue-500 transition"
                >
                    ← retour au forum
                </a>
            </div>

            {/* sections */}
            <div className="w-full max-w-4xl px-4 pb-16 space-y-6">
                {sections.map((section: any) => (
                    <div
                        key={section.id}
                        className="rounded-3xl shadow-2xl overflow-hidden"
                        style={{
                            backgroundColor: section.styles.bg,
                            color: section.styles.color,
                        }}
                    >
                        <div className="p-8 md:p-14">{renderSection(section)}</div>
                    </div>
                ))}
            </div>

            {/* footer stamp */}
            <footer className="w-full max-w-4xl px-4 pb-10 text-center">
                <p className="text-[10px] font-mono text-slate-400 opacity-50 uppercase tracking-widest">
                    Créé avec Open Day Builder · IUT Dijon MMI
                </p>
            </footer>
        </div>
    );
}