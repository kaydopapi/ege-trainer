import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { BookOpen, Check, X, HelpCircle } from 'lucide-react';

export default function SyntaxTrainer({ data, onResult, onOpenTheory }) {
  const [selectedMapping, setSelectedMapping] = useState({
    "А": "",
    "Б": "",
    "В": "",
    "Г": "",
    "Д": ""
  });
  const [isChecked, setIsChecked] = useState(false);

  const exam = data.examTask;

  const handleSelect = (key, val) => {
    if (isChecked) return;
    sounds.playClick();
    setSelectedMapping({ ...selectedMapping, [key]: val });
  };

  const handleCheck = () => {
    if (isChecked) return;
    setIsChecked(true);

    let correctCount = 0;
    Object.keys(exam.correctMapping).forEach((k) => {
      if (parseInt(selectedMapping[k]) === exam.correctMapping[k]) {
        correctCount++;
      }
    });

    const isAllCorrect = correctCount === 5;

    if (correctCount >= 4) {
      sounds.playSuccess();
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
    } else {
      sounds.playError();
    }

    onResult(isAllCorrect, {
      id: "syntax-8",
      taskId: 8,
      title: "Задание №8 (Синтаксис)",
      question: "Установите соответствие между ошибками и предложениями",
      userAnswer: Object.values(selectedMapping).join(''),
      correctAnswer: Object.values(exam.correctMapping).join(''),
      explanation: "Проверьте сопоставление по строкам"
    });
  };

  const handleReset = () => {
    setIsChecked(false);
    setSelectedMapping({ "А": "", "Б": "", "В": "", "Г": "", "Д": "" });
  };

  const isFormComplete = Object.values(selectedMapping).every((v) => v !== "");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            Банк ФИПИ • Задание №8
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Синтаксические нормы (Грамматические ошибки)
          </h2>
        </div>

        <button
          onClick={onOpenTheory}
          className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Шпаргалка к №8</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left column: 5 Errors to match */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Грамматические ошибки:
            </h3>

            <div className="space-y-3">
              {exam.errors.map((err) => {
                const currentVal = selectedMapping[err.key];
                const isCorrect = parseInt(currentVal) === exam.correctMapping[err.key];

                return (
                  <div
                    key={err.key}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${
                      isChecked
                        ? isCorrect
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                          : 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
                          {err.key}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold leading-snug">
                          {err.type}
                        </span>
                      </div>

                      <select
                        disabled={isChecked}
                        value={currentVal}
                        onChange={(e) => handleSelect(err.key, e.target.value)}
                        className="bg-white border-2 border-slate-300 rounded-xl px-2.5 py-1 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 shadow-xs cursor-pointer"
                      >
                        <option value="">—</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {isChecked && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                        <span className="font-bold">Верно: {exam.correctMapping[err.key]}</span> — {exam.explanations[err.key]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Answer Table */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Итоговый шифр:</span>
                {isChecked && (
                  <span className="text-indigo-600 font-mono font-black">
                    Ответ: {Object.values(exam.correctMapping).join('')}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                {Object.keys(selectedMapping).map((k) => (
                  <div key={k} className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-sans font-bold">{k}</div>
                    <div className="text-lg font-black text-slate-900">{selectedMapping[k] || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {!isChecked ? (
              <button
                disabled={!isFormComplete}
                onClick={handleCheck}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Проверить соответствие
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all cursor-pointer"
              >
                Попробовать снова
              </button>
            )}
          </div>
        </div>

        {/* Right column: 9 sentences */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
            Предложения:
          </h3>
          <div className="space-y-2.5">
            {exam.sentences.map((sent) => (
              <div
                key={sent.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-sm sm:text-base text-slate-800 leading-relaxed flex items-start gap-3.5 hover:border-slate-300 transition-colors"
              >
                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                  {sent.id}
                </span>
                <span>{sent.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
