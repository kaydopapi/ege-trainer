import React from 'react';
import { X, BookOpen, Lightbulb } from 'lucide-react';

export default function TheoryDrawer({ isOpen, onClose, taskData }) {
  if (!isOpen || !taskData) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-white border-l border-slate-200 p-6 sm:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {taskData.title}
                </h3>
                <span className="text-xs text-slate-500">
                  Методическая шпаргалка • Банк ФИПИ + Школково
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {taskData.rules && taskData.rules.map((rule, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>{rule.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {rule.text}
                </p>
                {rule.examples && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {rule.examples.map((ex, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-emerald-700 shadow-2xs">
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {taskData.categories && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Ключевые трудные случаи:
                </h4>
                {taskData.categories.map((cat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="font-extrabold text-indigo-700 text-sm">{cat.name}</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-800">
                      {cat.items.slice(0, 4).map((it, j) => (
                        <div key={j} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-emerald-700 font-bold block">{it.correct}</span>
                          <span className="text-slate-500 block text-[10px] mt-0.5">{it.tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {taskData.pleonasms && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Частые плеоназмы (исключить лишнее):
                </h4>
                <div className="grid gap-2">
                  {taskData.pleonasms.slice(0, 6).map((p, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-800 font-medium">{p.phrase}</span>
                      <span className="text-rose-700 font-bold">Лишнее: {p.redundant}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 mt-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
          >
            Понятно, вернуться к тренажёру
          </button>
        </div>
      </div>
    </div>
  );
}
