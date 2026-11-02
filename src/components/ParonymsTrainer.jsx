import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { BookOpen, Check, X, ArrowRight } from 'lucide-react';

export default function ParonymsTrainer({ data, onResult, onOpenTheory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('exam'); // 'exam' | 'pairs'

  const currentTask = data.examTasks[currentIndex] || data.examTasks[0];

  const handleCheck = () => {
    if (isChecked || !userAnswer.trim()) return;
    setIsChecked(true);

    const isCorrect = userAnswer.trim().toLowerCase() === currentTask.correctWord.toLowerCase();

    if (isCorrect) {
      sounds.playSuccess();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } else {
      sounds.playError();
    }

    onResult(isCorrect, {
      id: currentTask.id,
      taskId: 5,
      title: "Задание №5 (Паронимы)",
      question: currentTask.sentence,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentTask.correctWord,
      explanation: currentTask.explanation
    });
  };

  const handleNext = () => {
    setIsChecked(false);
    setUserAnswer('');
    setCurrentIndex((prev) => (prev + 1) % data.examTasks.length);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Submode Switcher */}
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
            ✍️ Практика ЕГЭ (Замена слова)
          </button>
          <button
            onClick={() => setActiveTab('pairs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'pairs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📚 Пары паронимов ФИПИ
          </button>
        </div>

        <button
          onClick={onOpenTheory}
          className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Правило к №5</span>
        </button>
      </div>

      {activeTab === 'exam' ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
              Банк ФИПИ • Задание №5
            </span>
            <p className="text-xs sm:text-sm text-slate-500">
              В одном из предложений ниже неверно употреблено выделенное слово. Исправьте лексическую ошибку, подобрав к нему пароним.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-lg sm:text-xl text-slate-900 font-medium leading-relaxed">
            {currentTask.sentence.split(currentTask.incorrectWord).map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="text-amber-800 bg-amber-100 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                    {currentTask.incorrectWord}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">
              Введите верный пароним:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                disabled={isChecked}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                placeholder="например: надеть"
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
                  <span>Дальше</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {isChecked && (
            <div
              className={`p-5 rounded-2xl border flex items-start gap-4 animate-in fade-in duration-200 ${
                userAnswer.trim().toLowerCase() === currentTask.correctWord.toLowerCase()
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/90 border-rose-200 text-rose-900'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0 border border-slate-200/60">
                {userAnswer.trim().toLowerCase() === currentTask.correctWord.toLowerCase() ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <X className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-base flex items-center gap-2">
                  <span>Правильный ответ:</span>
                  <span className="font-mono text-emerald-700 font-extrabold uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                    {currentTask.correctWord}
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
        /* PAIRS OVERVIEW */
        <div className="grid md:grid-cols-2 gap-4">
          {data.paronymPairs.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 shadow-md shadow-slate-200/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-lg border-b border-slate-100 pb-2">
                <span>{item.pair.join(' / ')}</span>
              </div>
              <div className="space-y-2 text-sm">
                {Object.entries(item.defs).map(([word, def]) => (
                  <div key={word} className="space-y-0.5">
                    <span className="font-bold text-slate-900">{word}:</span>
                    <span className="text-slate-600 ml-1.5">{def}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-bold text-slate-700">Примеры:</span> {item.examples.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
