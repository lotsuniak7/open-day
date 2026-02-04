"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import {
    Plus, Trash2, ArrowUp, ArrowDown, Rocket,
    Type, Image as ImageIcon, Link2, User,
    Video, CheckCircle, UploadCloud,
    Terminal, Zap, MousePointer, Code, Image, X,
    Wand2, QrCode, Share2, Copy, Calendar, Cpu
} from "lucide-react";

// --- GLOBAL CSS STYLES ---
const GLOBAL_STYLES = `
  @keyframes glitch {
    0% { transform: translate(0) }
    20% { transform: translate(-2px, 2px) }
    40% { transform: translate(-2px, -2px) }
    60% { transform: translate(2px, 2px) }
    80% { transform: translate(2px, -2px) }
    100% { transform: translate(0) }
  }
  .glitch-effect:hover {
    animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
    color: #00ff41;
    text-shadow: 2px 2px red;
  }
  .typing-cursor::after {
    content: '▋';
    animation: blink 1s infinite;
  }
  @keyframes blink { 0% { opacity: 0 } 50% { opacity: 1 } 100% { opacity: 0 } }
`;

// --- TYPES ---
type BlockType = 'hero' | 'glitch' | 'terminal' | 'bio' | 'project' | 'socials' | 'skills' | 'video' | 'clicker' | 'code' | 'timeline' | 'stack';

interface Section {
    id: string;
    type: BlockType;
    content: any;
    styles: {
        bg: string;
        color: string;
    };
}

// --- AI PRESETS ---
const AI_TITLES = ["Futur CEO", "Fullstack Genius", "Web Architect", "Creative Developer", "Hacker Éthique", "MMI Legend"];
const AI_BIOS = [
    "Je transforme le café en code propre.",
    "Passionné par le design minimaliste et les performances maximales.",
    "Mon objectif ? Construire le web de demain.",
    "Je ne corrige pas les bugs, je les élève."
];

// --- BACKGROUNDS ---
const BG_PRESETS = [
    { name: "Soleil", url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2015%2F04%2F23%2F22%2F00%2Ftree-736885_640.jpg&f=1&nofb=1&ipt=090cd8547716219cf6579c6120358d3ce4a9d9693e6702cdc4cf09116905fd94" },
    { name: "Chats", url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmarketplace.canva.com%2FEAFhwfMq3ds%2F1%2F0%2F1600w%2Fcanva-colorful-cute-cats-illustration-desktop-wallpaper-KBBZLdpjLcM.jpg&f=1&nofb=1&ipt=06a743a743cfd1a5dc3cdd25dc52fd99d3b4f8a24de2fb9918162957f3c1c12e" },
    { name: "Cyberpunk", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2000&q=80" },
    { name: "Dark Grid", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80" },
];

export default function PageBuilder() {
    // --- STATE ---
    const [sections, setSections] = useState<Section[]>([
        {
            id: '1',
            type: 'hero',
            content: { title: "Hello World", subtitle: "Bienvenue sur mon portfolio" },
            styles: { bg: '#ffffff', color: '#1e293b' }
        }
    ]);

    const [bgImage, setBgImage] = useState(BG_PRESETS[1].url);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [createdId, setCreatedId] = useState<string | null>(null);

    // Form State
    const [publishForm, setPublishForm] = useState({
        prenom: "",
        nom: "",
        orientation: "",
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSectionIdForUpload, setActiveSectionIdForUpload] = useState<string | null>(null);

    // --- ACTIONS ---

    const addSection = (type: BlockType) => {
        const newSection: Section = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: getDefaultContent(type),
            styles: getInitialStyles(type)
        };
        setSections([...sections, newSection]);
        setTimeout(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setSections(newSections);
    };

    const updateContent = (id: string, field: string, value: any) => {
        setSections(sections.map(s =>
            s.id === id ? { ...s, content: { ...s.content, [field]: value } } : s
        ));
    };

    const updateStyle = (id: string, field: 'bg' | 'color', value: string) => {
        setSections(sections.map(s =>
            s.id === id ? { ...s, styles: { ...s.styles, [field]: value } } : s
        ));
    };

    // --- AI GENERATORS ---
    const generateText = (id: string, field: string, type: 'title' | 'bio') => {
        const arr = type === 'title' ? AI_TITLES : AI_BIOS;
        const randomText = arr[Math.floor(Math.random() * arr.length)];
        updateContent(id, field, randomText);
    };

    // --- PHOTO UPLOAD ---
    const triggerImageUpload = (sectionId: string) => {
        setActiveSectionIdForUpload(sectionId);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeSectionIdForUpload) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateContent(activeSectionIdForUpload, 'image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- PUBLISH ---
    const handlePublishClick = () => {
        setShowPublishModal(true);
    };

    const handleSave = async () => {
        if (!publishForm.prenom.trim() || !publishForm.nom.trim() || !publishForm.orientation) return;

        setIsSaving(true);
        setShowPublishModal(false);

        try {
            const response = await fetch('/api/page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sections,
                    bgImage,
                    studentFirstName: publishForm.prenom.trim(),
                    studentLastName: publishForm.nom.trim(),
                    orientation: publishForm.orientation,
                }),
            });

            if (!response.ok) {
                alert("Erreur serveur (500)");
                setIsSaving(false);
                return;
            }

            const data = await response.json();

            if (data.success) {
                setCreatedId(data.id);
                setTimeout(() => {
                    setIsSaving(false);
                    setShowModal(true);

                    const duration = 3 * 1000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
                    const interval: any = setInterval(function() {
                        const timeLeft = animationEnd - Date.now();
                        if (timeLeft <= 0) return clearInterval(interval);
                        const particleCount = 50 * (timeLeft / duration);
                        confetti({ ...defaults, particleCount, origin: { x: 0.2, y: Math.random() - 0.2 } });
                        confetti({ ...defaults, particleCount, origin: { x: 0.8, y: Math.random() - 0.2 } });
                    }, 250);
                }, 500);
            } else {
                alert("Erreur sauvegarde !");
                setIsSaving(false);
            }
        } catch (e) {
            console.error(e);
            alert("Erreur réseau");
            setIsSaving(false);
        }
    };

    // --- DEFAULTS ---
    const getDefaultContent = (type: BlockType) => {
        switch (type) {
            case 'hero': return { title: "Mon Titre", subtitle: "Description" };
            case 'glitch': return { title: "CYBER_DEV", subtitle: "Hack the planet" };
            case 'terminal': return { text: "> System init...\n> Loading skills...\n> User: Admin\n> Ready." };
            case 'code': return { code: "function future() {\n  return 'Success';\n}", language: "javascript" };
            case 'bio': return { text: "Racontez votre histoire..." };
            case 'project': return { title: "Projet Alpha", desc: "Créé en 24h.", image: "" };
            case 'socials': return { linkedin: "", github: "", portfolio: "" };
            case 'skills': return { list: [{ name: "HTML", level: 90 }, { name: "JS", level: 60 }] };
            case 'video': return { url: "" };
            case 'clicker': return { count: 0, label: "Lignes de code" };
            case 'timeline': return { steps: [{ year: "2024", title: "Bac", desc: "Mention Bien" }] };
            case 'stack': return { tools: ["Figma", "React", "Python"] };
            default: return {};
        }
    };

    const getInitialStyles = (type: BlockType) => {
        if (type === 'terminal' || type === 'code') return { bg: '#1e1e1e', color: '#00ff41' };
        if (type === 'glitch') return { bg: '#000000', color: '#ef4444' };
        return { bg: '#ffffff', color: '#1e293b' };
    };

    return (
        <div className="h-screen bg-[#e2e8f0] flex font-sans text-slate-900 overflow-hidden relative">
            <style>{GLOBAL_STYLES}</style>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange}/>

            {/* --- MODAL FORM --- */}
            {showPublishModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-800">Avant de publier</h2>
                            <button onClick={() => setShowPublishModal(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Prénom</label>
                                    <input className="w-full p-3 bg-slate-50 border rounded-xl font-bold" placeholder="Marie" value={publishForm.prenom} onChange={e => setPublishForm({...publishForm, prenom: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Nom</label>
                                    <input className="w-full p-3 bg-slate-50 border rounded-xl font-bold" placeholder="Curie" value={publishForm.nom} onChange={e => setPublishForm({...publishForm, nom: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400">Parcours visé</label>
                                <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={publishForm.orientation} onChange={e => setPublishForm({...publishForm, orientation: e.target.value})}>
                                    <option value="" disabled>Choisir...</option>
                                    <option value="dev">Développement Web</option>
                                    <option value="design">Design / Création</option>
                                    <option value="com">Communication</option>
                                    <option value="jsp">Je ne sais pas encore</option>
                                </select>
                            </div>
                            <button onClick={handleSave} disabled={!publishForm.prenom || !publishForm.nom || !publishForm.orientation} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex justify-center gap-2 disabled:opacity-50 mt-4">
                                <Rocket size={20}/> PUBLIER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL SUCCESS --- */}
            {showModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-blue-500/20">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                            <Rocket size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">C'est en ligne !</h2>
                        <p className="text-slate-500 mb-8 font-medium">Scanne le code pour garder ta page.</p>

                        <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 inline-block mb-8 relative group cursor-pointer">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${typeof window !== 'undefined' ? window.location.origin : ''}/view/${createdId}`}
                                alt="QR Code"
                                className="w-48 h-48 mix-blend-multiply"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <a href={`/view/${createdId}`} target="_blank" className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-2">
                                <Share2 size={18}/> Voir ma page
                            </a>
                            <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:scale-[1.02]">
                                ✨ TERMINER (NOUVEL ÉTUDIANT)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SIDEBAR --- */}
            <aside className="w-[340px] bg-white border-r border-slate-300 flex flex-col z-20 shadow-2xl relative">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Code className="text-blue-600" strokeWidth={3} />
                        FAIS TON BANGER
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Journée Portes Ouvertes chez MMI</p>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-6">

                    <div>
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1">
                            <Zap size={10}/> Interactif
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <BlockBtn onClick={() => addSection('glitch')} icon={<Zap/>} label="Glitch" special />
                            <BlockBtn onClick={() => addSection('code')} icon={<Code/>} label="Code" special />
                            <BlockBtn onClick={() => addSection('terminal')} icon={<Terminal/>} label="Terminal" special />
                            <BlockBtn onClick={() => addSection('clicker')} icon={<MousePointer/>} label="Jeu" special />
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Classique</p>
                        <div className="grid grid-cols-2 gap-2">
                            <BlockBtn onClick={() => addSection('hero')} icon={<Type/>} label="Titre" />
                            <BlockBtn onClick={() => addSection('timeline')} icon={<Calendar/>} label="Parcours" />
                            <BlockBtn onClick={() => addSection('stack')} icon={<Cpu/>} label="Stack" />
                            <BlockBtn onClick={() => addSection('bio')} icon={<User/>} label="Bio" />
                            <BlockBtn onClick={() => addSection('project')} icon={<ImageIcon/>} label="Projet" />
                            <BlockBtn onClick={() => addSection('skills')} icon={<CheckCircle/>} label="Skills" />
                            <BlockBtn onClick={() => addSection('video')} icon={<Video/>} label="Vidéo" />
                            <BlockBtn onClick={() => addSection('socials')} icon={<Link2/>} label="Liens" />
                        </div>
                    </div>

                    <hr className="border-slate-100"/>

                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1">
                            <Image size={10}/> Fond d'écran
                        </p>
                        <div className="flex gap-2 mb-3">
                            {BG_PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => setBgImage(preset.url)}
                                    className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden hover:scale-110 transition shadow-sm relative"
                                    title={preset.name}
                                >
                                    <img src={preset.url} className="w-full h-full object-cover" alt={preset.name}/>
                                </button>
                            ))}
                            <button onClick={() => setBgImage("")} className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-red-500 transition shadow-sm"><X size={14}/></button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={handlePublishClick}
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 hover:scale-[1.02]"
                    >
                        {isSaving ? "Publication..." : <><Rocket size={18} /> PUBLIER MA PAGE</>}
                    </button>
                </div>
            </aside>

            {/* --- CANVAS --- */}
            <main className="flex-1 relative flex flex-col items-center transition-all overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundColor: '#cbd5e1', backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}>
                <div ref={scrollRef} className="w-full flex-1 overflow-y-auto p-8 pb-32 flex flex-col items-center z-10">
                    <div className="w-full max-w-4xl">

                        {sections.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-300/50 rounded-3xl bg-white/80 backdrop-blur">
                                <code className="mb-2 text-sm bg-slate-100 px-2 py-1 rounded">{'<empty>'}</code>
                                <p>Ajoutez un bloc pour commencer.</p>
                            </div>
                        )}

                        {sections.map((section, index) => (
                            <div
                                key={section.id}
                                className="group relative mb-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 ring-2 ring-transparent hover:ring-blue-500/40"
                                style={{ backgroundColor: section.styles.bg, color: section.styles.color }}
                            >
                                {/* Controls */}
                                <div className="absolute -right-12 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-50">
                                    <div className="bg-white text-slate-600 shadow-md rounded-lg p-1 flex flex-col gap-1">
                                        <button onClick={() => moveSection(index, 'up')} className="p-1.5 hover:bg-slate-100 rounded"><ArrowUp size={16}/></button>
                                        <button onClick={() => moveSection(index, 'down')} className="p-1.5 hover:bg-slate-100 rounded"><ArrowDown size={16}/></button>
                                    </div>
                                    <div className="bg-white shadow-md rounded-lg p-2 flex flex-col gap-2 items-center">
                                        <label className="cursor-pointer relative w-6 h-6 rounded-full border shadow-inner" style={{ background: section.styles.bg }}>
                                            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={section.styles.bg} onChange={(e) => updateStyle(section.id, 'bg', e.target.value)}/>
                                        </label>
                                        <label className="cursor-pointer relative w-6 h-6 rounded-full border shadow-inner flex items-center justify-center font-bold text-[10px]" style={{ background: section.styles.color, color: section.styles.bg }}>
                                            T
                                            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={section.styles.color} onChange={(e) => updateStyle(section.id, 'color', e.target.value)}/>
                                        </label>
                                    </div>
                                    <button onClick={() => removeSection(section.id)} className="bg-white text-red-500 shadow-md rounded-lg p-2 hover:bg-red-50"><Trash2 size={16}/></button>
                                </div>

                                <div className="p-8 md:p-12">

                                    {/* --- NEW: TIMELINE BLOCK --- */}
                                    {section.type === 'timeline' && (
                                        <div>
                                            <h3 className="text-sm font-bold uppercase opacity-50 mb-6 border-b border-current/10 pb-2">Mon Parcours</h3>
                                            <div className="space-y-6 relative border-l-2 border-current/20 ml-2 pl-6">
                                                {section.content.steps.map((step: any, i: number) => (
                                                    <div key={i} className="relative">
                                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-current bg-inherit z-10"></div>
                                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-baseline">
                                                            <input className="font-mono font-bold text-lg bg-transparent border-none outline-none w-20" value={step.year} onChange={(e) => {const ns = [...section.content.steps]; ns[i].year = e.target.value; updateContent(section.id, 'steps', ns)}} />
                                                            <div className="flex-1">
                                                                <input className="font-bold text-xl bg-transparent border-none outline-none w-full" value={step.title} onChange={(e) => {const ns = [...section.content.steps]; ns[i].title = e.target.value; updateContent(section.id, 'steps', ns)}} />
                                                                <input className="opacity-60 text-sm bg-transparent border-none outline-none w-full" value={step.desc} onChange={(e) => {const ns = [...section.content.steps]; ns[i].desc = e.target.value; updateContent(section.id, 'steps', ns)}} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => updateContent(section.id, 'steps', [...section.content.steps, {year: "202"+(section.content.steps.length+4), title: "Futur...", desc: "..."}])} className="text-xs font-bold opacity-50 hover:opacity-100 flex items-center gap-1 mt-4"><Plus size={12}/> Ajouter une étape</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* --- NEW: TECH STACK --- */}
                                    {section.type === 'stack' && (
                                        <div className="text-center">
                                            <h3 className="text-sm font-bold uppercase opacity-50 mb-6">Ma Stack Technique</h3>
                                            <div className="flex flex-wrap justify-center gap-3">
                                                {section.content.tools.map((tool: string, i: number) => (
                                                    <div key={i} className="group/tag relative">
                                                        <input
                                                            className="bg-current/10 rounded-lg px-4 py-2 font-bold text-lg text-center min-w-[80px] border-none outline-none"
                                                            style={{ color: section.styles.color }}
                                                            value={tool}
                                                            onChange={(e) => { const nt = [...section.content.tools]; nt[i] = e.target.value; updateContent(section.id, 'tools', nt); }}
                                                        />
                                                        <button onClick={() => { const nt = section.content.tools.filter((_:any, idx:number) => idx !== i); updateContent(section.id, 'tools', nt); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/tag:opacity-100 transition"><X size={10}/></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => updateContent(section.id, 'tools', [...section.content.tools, "New"])} className="bg-current/5 border-2 border-dashed border-current/20 rounded-lg px-4 py-2 opacity-50 hover:opacity-100 transition"><Plus size={20}/></button>
                                            </div>
                                        </div>
                                    )}

                                    {/* GLITCH */}
                                    {section.type === 'glitch' && (
                                        <div className="text-center space-y-4">
                                            <div className="relative">
                                                <input
                                                    className="glitch-effect w-full text-5xl md:text-7xl font-black text-center bg-transparent border-none outline-none uppercase tracking-tighter"
                                                    value={section.content.title}
                                                    onChange={(e) => updateContent(section.id, 'title', e.target.value)}
                                                />
                                                <button onClick={() => generateText(section.id, 'title', 'title')} className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 bg-white/10 rounded-full hover:bg-white/20 transition" title="Générer texte IA"><Wand2 size={16}/></button>
                                            </div>
                                            <input className="w-full text-xl text-center bg-transparent border-none outline-none opacity-80 font-mono" value={section.content.subtitle} onChange={(e) => updateContent(section.id, 'subtitle', e.target.value)}/>
                                        </div>
                                    )}

                                    {/* CODE SNIPPET */}
                                    {section.type === 'code' && (
                                        <div className="font-mono text-sm relative">
                                            <div className="flex justify-between items-center mb-2 opacity-60 text-xs uppercase tracking-widest">
                                                <span>{section.content.language || 'javascript'}</span>
                                                <Copy size={12}/>
                                            </div>
                                            <textarea
                                                className="w-full h-32 bg-transparent border-none outline-none resize-none text-current opacity-90 leading-relaxed"
                                                value={section.content.code}
                                                onChange={(e) => updateContent(section.id, 'code', e.target.value)}
                                                spellCheck={false}
                                            />
                                        </div>
                                    )}

                                    {/* TERMINAL */}
                                    {section.type === 'terminal' && (
                                        <div className="font-mono text-sm">
                                            <div className="flex gap-1.5 mb-4 opacity-50"><div className="w-3 h-3 rounded-full bg-red-500"/><div className="w-3 h-3 rounded-full bg-yellow-500"/><div className="w-3 h-3 rounded-full bg-green-500"/></div>
                                            <textarea className="typing-cursor w-full h-32 bg-transparent border-none outline-none resize-none text-green-400 placeholder-green-700" value={section.content.text} onChange={(e) => updateContent(section.id, 'text', e.target.value)}/>
                                        </div>
                                    )}

                                    {/* CLICKER */}
                                    {section.type === 'clicker' && (
                                        <div className="text-center py-4">
                                            <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4">Clicker</h3>
                                            <div className="text-6xl font-black mb-2 font-mono">{section.content.count}</div>
                                            <button className="bg-current px-8 py-3 rounded-full font-bold text-lg hover:scale-110 active:scale-95 transition-transform shadow-xl" style={{ color: section.styles.bg }} onClick={() => updateContent(section.id, 'count', section.content.count + 1)}>⚡ Push</button>
                                        </div>
                                    )}

                                    {/* HERO */}
                                    {section.type === 'hero' && (
                                        <div className="text-center space-y-4">
                                            <div className="relative group/edit">
                                                <input className="w-full text-5xl font-black text-center bg-transparent border-none outline-none" value={section.content.title} onChange={(e) => updateContent(section.id, 'title', e.target.value)}/>
                                                <button onClick={() => generateText(section.id, 'title', 'title')} className="absolute top-2 right-10 p-2 opacity-0 group-hover/edit:opacity-100 text-blue-500 bg-blue-50 rounded-full transition"><Wand2 size={16}/></button>
                                            </div>
                                            <input className="w-full text-xl text-center bg-transparent border-none outline-none opacity-70" value={section.content.subtitle} onChange={(e) => updateContent(section.id, 'subtitle', e.target.value)}/>
                                        </div>
                                    )}

                                    {/* BIO */}
                                    {section.type === 'bio' && (
                                        <div className="relative group/edit">
                                            <textarea className="w-full text-lg leading-relaxed bg-transparent border-none outline-none resize-none h-auto" value={section.content.text} onChange={(e) => updateContent(section.id, 'text', e.target.value)} rows={3} onInput={(e: any) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}/>
                                            <button onClick={() => generateText(section.id, 'text', 'bio')} className="absolute top-0 right-0 p-2 opacity-0 group-hover/edit:opacity-100 text-orange-500 bg-orange-50 rounded-full transition"><Wand2 size={16}/></button>
                                        </div>
                                    )}

                                    {/* PROJECT */}
                                    {section.type === 'project' && (
                                        <div className="flex flex-col gap-6">
                                            <div className="relative w-full aspect-video bg-black/5 rounded-xl overflow-hidden border-2 border-dashed border-current/20 hover:border-current/50 transition cursor-pointer group/img flex items-center justify-center" onClick={() => triggerImageUpload(section.id)}>
                                                {section.content.image ? <img src={section.content.image} className="w-full h-full object-cover" alt="Project" /> : <div className="text-center opacity-40 group-hover/img:opacity-100 transition"><UploadCloud size={32} className="mx-auto mb-2"/><span className="text-sm font-bold">Image</span></div>}
                                            </div>
                                            <div>
                                                <input className="w-full text-2xl font-bold bg-transparent border-none outline-none mb-2" value={section.content.title} onChange={(e) => updateContent(section.id, 'title', e.target.value)}/>
                                                <textarea className="w-full opacity-80 bg-transparent border-none outline-none resize-none" value={section.content.desc} onChange={(e) => updateContent(section.id, 'desc', e.target.value)}/>
                                            </div>
                                        </div>
                                    )}

                                    {/* SKILLS */}
                                    {section.type === 'skills' && (
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6 flex items-center gap-2"><CheckCircle size={14}/> Skills</h4>
                                            <div className="space-y-4">
                                                {section.content.list.map((skill: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <input className="bg-transparent border-none outline-none font-bold text-right w-32" value={skill.name} onChange={(e) => { const newList = [...section.content.list]; newList[i].name = e.target.value; updateContent(section.id, 'list', newList); }}/>
                                                        <div className="flex-1 h-3 bg-current/10 rounded-full overflow-hidden relative"><div className="h-full bg-current rounded-full" style={{ width: `${skill.level}%` }}></div><input type="range" min="0" max="100" className="absolute inset-0 opacity-0 cursor-pointer" value={skill.level} onChange={(e) => { const newList = [...section.content.list]; newList[i].level = e.target.value; updateContent(section.id, 'list', newList); }}/></div>
                                                    </div>
                                                ))}
                                                <button onClick={() => updateContent(section.id, 'list', [...section.content.list, { name: "New", level: 50 }])} className="text-xs font-bold opacity-50 hover:opacity-100 flex items-center gap-1 mt-2"><Plus size={12}/> Ajouter</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* VIDEO */}
                                    {section.type === 'video' && (
                                        <div className="space-y-4">
                                            {!section.content.url ? (
                                                <div className="p-8 border-2 border-dashed border-current/20 rounded-xl text-center opacity-60">
                                                    <Video size={32} className="mx-auto mb-2"/>
                                                    <input className="w-full bg-transparent border-b border-current/30 text-center py-2 outline-none" placeholder="Lien YouTube..." onChange={(e) => { const val = e.target.value; const videoId = val.split('v=')[1] || val.split('/').pop(); if(videoId) updateContent(section.id, 'url', `https://www.youtube.com/embed/${videoId}`); }}/>
                                                </div>
                                            ) : (
                                                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border-4 border-current">
                                                    <iframe src={section.content.url} className="w-full h-full" allowFullScreen title="Video"/>
                                                    <button onClick={() => updateContent(section.id, 'url', '')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"><Trash2 size={12}/></button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* SOCIALS */}
                                    {section.type === 'socials' && (
                                        <div className="flex flex-wrap gap-3 justify-center">
                                            {['linkedin', 'github', 'portfolio'].map(net => (
                                                <div key={net} className="flex items-center bg-current/10 rounded-full px-4 py-2 border border-current/10">
                                                    <span className="text-[10px] font-bold uppercase opacity-60 mr-2">{net}</span>
                                                    <input className="bg-transparent border-none outline-none text-sm w-24 font-bold" value={section.content[net]} onChange={(e) => updateContent(section.id, net, e.target.value)} placeholder="..."/>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}

                        <div className="h-24 border-2 border-dashed border-slate-300/50 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-500 hover:bg-white/40 transition cursor-pointer gap-2 backdrop-blur-sm" onClick={() => addSection('project')}>
                            <Plus size={20} /><span>Ajouter un bloc...</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Button Component
function BlockBtn({ onClick, icon, label, special }: any) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition gap-2 group ${special ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-purple-200 hover:shadow-md' : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-sm'}`}>
            <div className={`${special ? 'text-purple-600' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`}>{icon}</div>
            <span className={`text-xs font-bold ${special ? 'text-purple-800' : 'text-slate-600'}`}>{label}</span>
        </button>
    );
}