"use client";

import React, { useState, useEffect } from "react";
import { Code, Eye, Play, Save, User } from "lucide-react";

export default function Home() {
  // 1. Состояние для кода (HTML, CSS, JS) и данных студента
  const [htmlCode, setHtmlCode] = useState<string>(`
<div class="card">
  <h1>Привет, Институт!</h1>
  <p>Меня зовут [Твое Имя] и я хочу сюда поступить.</p>
  <button id="myBtn">Нажми меня</button>
</div>`);

  const [cssCode, setCssCode] = useState<string>(`
body {
  background: #1a1a2e;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  font-family: sans-serif;
}
.card {
  background: linear-gradient(145deg, #e63946, #f1faee);
  color: #1d3557;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  text-align: center;
  transition: transform 0.3s;
}
.card:hover {
  transform: scale(1.05);
}
button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #1d3557;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}
`);

  const [jsCode, setJsCode] = useState<string>(`
document.getElementById('myBtn').addEventListener('click', () => {
  alert('Ты уже программист! 🚀');
  document.body.style.background = '#ffba08';
});
`);

  const [studentName, setStudentName] = useState("");
  const [srcDoc, setSrcDoc] = useState("");

  // 2. Функция сборки (компиляции) кода в живом времени
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <style>${cssCode}</style>
          <body>${htmlCode}</body>
          <script>${jsCode}</script>
        </html>
      `);
    }, 250); // Небольшая задержка, чтобы не рендерить на каждый клик

    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  // 3. Заглушка для сохранения (сделаем в следующем шаге)
  const handleSave = () => {
    if (!studentName) {
      alert("Пожалуйста, представься (введи имя сверху)!");
      return;
    }
    console.log("Saving...", { studentName, htmlCode, cssCode, jsCode });
    alert(`Круто, ${studentName}! Твоя страница сохранена (пока в консоль).`);
  };

  return (
      <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden">
        {/* ЛЕВАЯ КОЛОНКА: Редактор */}
        <div className="w-1/2 flex flex-col border-r border-slate-700">

          {/* Хедер редактора */}
          <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Code className="text-blue-400" />
              <span className="font-bold text-lg">Hacker Mode</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full">
              <User size={16} className="text-slate-400" />
              <input
                  type="text"
                  placeholder="Твое Имя и Фамилия"
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-400 w-40"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
          </div>

          {/* Области кода (Скролл) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* HTML Блок */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-orange-400 uppercase">HTML (Структура)</label>
              <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full h-32 bg-slate-950 p-3 rounded border border-slate-700 font-mono text-sm text-gray-300 focus:border-orange-500 outline-none resize-none"
              />
            </div>

            {/* CSS Блок */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-400 uppercase">CSS (Стиль)</label>
              <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="w-full h-32 bg-slate-950 p-3 rounded border border-slate-700 font-mono text-sm text-gray-300 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            {/* JS Блок */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-yellow-400 uppercase">JS (Интерактив)</label>
              <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="w-full h-32 bg-slate-950 p-3 rounded border border-slate-700 font-mono text-sm text-gray-300 focus:border-yellow-500 outline-none resize-none"
              />
            </div>

          </div>

          {/* Футер с кнопкой */}
          <div className="p-4 bg-slate-800 border-t border-slate-700">
            <button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all"
            >
              <Save size={20} />
              Опубликовать мой сайт
            </button>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Превью */}
        <div className="w-1/2 flex flex-col bg-white">
          <div className="p-2 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Eye size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Live Preview</span>
            </div>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Песочница (Iframe) */}
            <iframe
                srcDoc={srcDoc}
                title="output"
                sandbox="allow-scripts"
                className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
  );
}