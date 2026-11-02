import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { BookOpen, Check, X, ArrowRight } from 'lucide-react';

export default function LexicsTrainer({ data, onResult, onOpenTheory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState('');
  const [inputAnswer, setInputAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const currentTask = data.examTasks[currentIndex] || data.examTasks[0];

  const handleWordSelect = (w) => {
    if (isChecked) return;
    sounds.playClick();
    const clean = w.toLowerCase().replace(/[.,!?;:«»]/g, '');
    setSelectedWord(clean);
  };

  const handleCheck = () => {
    if (isChecked) return;
    let isCorrect = false;

    if (currentTask.type === 'exclude') {
      const target = currentTask.correctAnswer.toLowerCase();
      isCorrect = selectedWord.toLowerCase() === target || inputAnswer.trim().toLowerCase() === target;
    } else {
      isCorrect = inputAnswer.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase();
    }

    setIsChecked(true);

    if (isCorrect) {
      sounds.playSuccess();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } else {
      sounds.playError();
    }

    onResult(isCorrect, {
      id: currentTask.id,
      taskId: 6,
      title: "Задание №6 (Лексика)",
      question: currentTask.sentence,
      userAnswer: currentTask.type === 'exclude' ? (selectedWord || inputAnswer.trim()) : inputAnswer.trim(),
      correctAnswer: currentTask.correctAnswer,
      explanation: currentTask.explanation
    });
  };

  const handleNext = () => {
    setIsChecked(false);
    setSelectedWord('');
    setInputAnswer('');
    setCurrentIndex((prev) => (prev + 1) % data.examTasks.length);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200">
            Банк ФИПИ • Задание №6
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {currentTask.type === 'exclude' ? 'Исключение лишнего слова (плеоназм)' : 'Замена неверного слова'}
          </h2>
        </div>

        <button
          onClick={onOpenTheory}
          className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Шпаргалка к №6</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
        <p className="text-xs sm:text-sm text-slate-500">
          {currentTask.type === 'exclude'
            ? 'Исправьте лексическую ошибку, исключив лишнее слово. Вы можете кликнуть по лишнему слову прямо в тексте или ввести его в поле.'
            : 'Исправьте лексическую ошибку, заменив неверно употреблённое слово на нормативное.'}
        </p>

        {/* Interactive clickable sentence */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-lg sm:text-xl leading-relaxed text-slate-800 flex flex-wrap gap-x-2 gap-y-1.5 items-center">
          {currentTask.sentence.split(' ').map((rawWord, idx) => {
            const cleanWord = rawWord.toLowerCase().replace(/[.,!?;:«»]/g, '');
            const isWordSelected = selectedWord === cleanWord;
            const isClickable = currentTask.type === 'exclude' && !isChecked;

            return (
              <span
                key={idx}
                onClick={() => isClickable && handleWordSelect(rawWord)}
                className={`transition-all rounded-lg px-2 py-0.5 select-none ${
                  isClickable ? 'cursor-pointer hover:bg-violet-100 hover:text-violet-900' : ''
                } ${
                  isWordSelected
                    ? 'bg-violet-600 text-white font-bold ring-4 ring-violet-100 scale-105 shadow-sm'
                    : ''
                }`}
              >
                {rawWord}
              </span>
            );
          })}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700">
            {currentTask.type === 'exclude' ? 'Лишнее слово:' : 'Замените на:'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              disabled={isChecked}
              value={currentTask.type === 'exclude' && selectedWord ? selectedWord : inputAnswer}
              onChange={(e) => {
                setInputAnswer(e.target.value);
                if (currentTask.type === 'exclude') setSelectedWord('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              placeholder={currentTask.type === 'exclude' ? 'кликните по слову или введите' : 'введите верное слово'}
              className="flex-1 bg-white border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3.5 text-lg font-mono text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
            />
            {!isChecked ? (
              <button
                disabled={!(selectedWord || inputAnswer.trim())}
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
              (currentTask.type === 'exclude'
                ? selectedWord === currentTask.correctAnswer.toLowerCase() || inputAnswer.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase()
                : inputAnswer.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase())
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/90 border-rose-200 text-rose-900'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0 border border-slate-200/60">
              {(currentTask.type === 'exclude'
                ? selectedWord === currentTask.correctAnswer.toLowerCase() || inputAnswer.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase()
                : inputAnswer.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase()) ? (
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
    </div>
  );
}
