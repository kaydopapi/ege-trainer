import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { BookOpen, Check, X, ArrowRight } from 'lucide-react';

export default function MorphologyTrainer({ data, onResult, onOpenTheory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('exam'); // 'exam' | 'cheat'

  const currentTask = data.examTasks[currentIndex] || data.examTasks[0];

  const handleCheck = () => {
    if (isChecked || !userAnswer.trim()) return;
    setIsChecked(true);

    const isCorrect = userAnswer.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase();

    if (isCorrect) {
      sounds.playSuccess();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } else {
      sounds.playError();
    }

    onResult(isCorrect, {
      id: currentTask.id,
      taskId: 7,
      title: "Задание №7 (Морфология)",
      question: "Исправьте ошибку в образовании формы слова",
      userAnswer: userAnswer.trim(),
      correctAnswer: currentTask.correctAnswer,
      explanation: currentTask.explanation
    });
  };

  const handleNext = () => {
    setIsChecked(false);
    setUserAnswer('');
    setSelectedOptionIdx(null);
    setCurrentIndex((prev) => (prev + 1) % data.examTasks.length);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Задание №7 (Формат ЕГЭ)
          </button>
          <button
            onClick={() => setActiveTab('cheat')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'cheat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📚 Справочник форм слов
          </button>
        </div>

        <button
          onClick={onOpenTheory}
          className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Шпаргалка к №7</span>
        </button>
      </div>

      {activeTab === 'exam' ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Банк ФИПИ • Задание №7
            </span>
            <p className="text-xs sm:text-sm text-slate-500">
              В одном из выделенных ниже слов допущена ошибка в образовании формы слова. <strong className="text-slate-800">Исправьте ошибку</strong> и запишите слово правильно.
            </p>
          </div>

          <div className="grid gap-2.5">
            {currentTask.options.map((opt, idx) => {
              const isTargetError = idx === currentTask.incorrectIdx;
              const isSelected = selectedOptionIdx === idx;

              let style = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs';
              if (isChecked) {
                if (isTargetError) {
                  style = 'bg-rose-50 border-rose-400 text-rose-900 ring-4 ring-rose-100 font-bold';
                } else {
                  style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                style = 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-100 font-bold';
              }

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (!isChecked) {
                      sounds.playClick();
                      setSelectedOptionIdx(idx);
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 text-base sm:text-lg font-mono flex items-center justify-between cursor-pointer transition-all ${style}`}
                >
                  <span>{opt}</span>
                  {isChecked && isTargetError && (
                    <span className="text-xs font-sans font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-lg border border-rose-200">
                      Ошибка здесь!
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-sm font-bold text-slate-700">
              Запишите исправленное слово:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                disabled={isChecked}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                placeholder="например: шофёры"
                className="flex-1 bg-white border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3.5 text-lg font-mono text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
              />
              {!isChecked ? (
                <button
                  disabled={!userAnswer.trim()}
                  onClick={handleCheck}
                  className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Ответить
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <span>Следующее</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {isChecked && (
            <div
              className={`p-5 rounded-2xl border flex items-start gap-4 animate-in fade-in duration-200 ${
                userAnswer.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase()
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/90 border-rose-200 text-rose-900'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0 border border-slate-200/60">
                {userAnswer.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase() ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <X className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-base flex items-center gap-2">
                  <span>Правильный ответ:</span>
                  <span className="font-mono text-emerald-700 font-extrabold uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                    {currentTask.correctAnswer}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                  💡 {currentTask.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CHEAT SHEET CATEGORIES */
        <div className="grid md:grid-cols-2 gap-4">
          {data.categories.map((cat, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 shadow-md shadow-slate-200/30 rounded-2xl p-5 space-y-3">
              <h3 className="text-emerald-700 font-black text-base border-b border-slate-100 pb-2">
                {cat.name}
              </h3>
              <div className="space-y-2 text-sm">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex flex-col gap-0.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-extrabold font-mono">{item.correct}</span>
                      <span className="text-xs text-rose-600 line-through">({item.wrong})</span>
                    </div>
                    <span className="text-xs text-slate-500">{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
