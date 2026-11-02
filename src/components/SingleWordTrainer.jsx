import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { Check, X, ArrowRight, Zap, BookOpen, Pause, Play } from 'lucide-react';

const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
};

const prepareWords = (words) =>
  shuffle(words).map((word) => ({
    ...word,
    // The source bank stores the correct letter first. Shuffle a copy so the
    // position of the right answer is not predictable in the sprint.
    options: shuffle(word.options || [])
  }));

export default function SingleWordTrainer({
  words,
  taskTitle,
  taskId,
  onResult,
  onOpenTheory
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef(null);

  // Initialize and shuffle words
  useEffect(() => {
    if (words && words.length > 0) {
      setShuffled(prepareWords(words));
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsPaused(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [words]);

  const currentWord = shuffled[currentIndex] || words[0];

  const handleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsPaused(false);

    if (currentIndex < shuffled.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop with re-shuffled list for continuous endless drill!
      setShuffled(prepareWords(words));
      setCurrentIndex(0);
    }
  }, [currentIndex, shuffled.length, words]);

  const handleSelect = useCallback((opt) => {
    if (isAnswered || !currentWord) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt.toLowerCase() === currentWord.target.toLowerCase();

    if (isCorrect) {
      sounds.playSuccess();
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.7 }
      });
    } else {
      sounds.playError();
    }

    onResult(isCorrect, {
      id: currentWord.id,
      taskId: taskId,
      title: taskTitle,
      question: `Вставьте пропущенную букву в слове: ${currentWord.word}`,
      userAnswer: opt,
      correctAnswer: currentWord.target,
      explanation: currentWord.rule
    });

    // Auto-advance ONLY on correct answer, with a calm 1400ms duration so user sees feedback!
    // NEVER auto-advance on error!
    if (isCorrect && autoAdvance && !isPaused) {
      timerRef.current = setTimeout(() => {
        handleNext();
      }, 1400);
    }
  }, [isAnswered, currentWord, taskId, taskTitle, onResult, autoAdvance, isPaused, handleNext]);

  const togglePause = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused((prev) => !prev);
  };

  // Keyboard shortcut support with repeat-guard
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key repeats to avoid accidental double-skipping
      if (e.repeat) return;

      if (isAnswered) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (!currentWord || !currentWord.options) return;

      const key = e.key.toLowerCase();
      const matchedOption = currentWord.options.find(
        (opt) => opt.toLowerCase() === key
      );

      if (matchedOption) {
        e.preventDefault();
        handleSelect(matchedOption);
      } else if (e.key === '1' && currentWord.options[0]) {
        e.preventDefault();
        handleSelect(currentWord.options[0]);
      } else if (e.key === '2' && currentWord.options[1]) {
        e.preventDefault();
        handleSelect(currentWord.options[1]);
      } else if (e.key === '3' && currentWord.options[2]) {
        e.preventDefault();
        handleSelect(currentWord.options[2]);
      } else if (e.key === '4' && currentWord.options[3]) {
        e.preventDefault();
        handleSelect(currentWord.options[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentWord, handleSelect, handleNext]);

  if (!currentWord) return null;

  const isCorrect = selectedOption?.toLowerCase() === currentWord.target.toLowerCase();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden space-y-8 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 uppercase tracking-wider text-[11px]">
            ⚡ Спринт по словам
          </span>
          <span className="text-slate-500 font-medium">
            Слово <strong className="text-slate-900 font-bold">{currentIndex + 1}</strong> из {shuffled.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => {
                setAutoAdvance(e.target.checked);
                if (!e.target.checked && timerRef.current) clearTimeout(timerRef.current);
              }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Автопереход (1.4 сек)</span>
          </label>

          <button
            onClick={onOpenTheory}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Шпаргалка</span>
          </button>
        </div>
      </div>

      {/* Main Single Word Display */}
      <div className="text-center py-6 sm:py-8 space-y-4">
        <div className="inline-flex items-center justify-center flex-wrap gap-1 text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-wide text-slate-900 select-none">
          <span>{currentWord.prefix}</span>

          {/* Missing letter slot */}
          <span
            className={`inline-flex items-center justify-center min-w-[2.2ch] h-14 sm:h-20 px-2 sm:px-3 mx-1 rounded-2xl border-2 font-mono uppercase transition-all duration-200 ${
              !isAnswered
                ? 'bg-indigo-50 border-dashed border-indigo-400 text-indigo-600 animate-pulse shadow-inner'
                : isCorrect
                ? 'bg-emerald-600 text-white border-emerald-500 ring-4 ring-emerald-100 scale-105 shadow-md shadow-emerald-500/20'
                : 'bg-rose-600 text-white border-rose-500 ring-4 ring-rose-100 scale-105 shadow-md shadow-rose-500/20'
            }`}
          >
            {isAnswered ? currentWord.target.toUpperCase() : '_'}
          </span>

          <span>{currentWord.suffix}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-500">
          Нажмите букву на клавиатуре или кликните вариант ниже
        </p>
      </div>

      {/* Letter Option Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
        {currentWord.options.map((opt, idx) => {
          const isTarget = opt.toLowerCase() === currentWord.target.toLowerCase();
          const isChosen = selectedOption?.toLowerCase() === opt.toLowerCase();

          let btnClass = 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-400 text-slate-800 hover:text-indigo-700 shadow-sm hover:scale-105 active:scale-95';

          if (isAnswered) {
            if (isTarget) {
              btnClass = 'bg-emerald-600 border-emerald-500 text-white ring-4 ring-emerald-100 font-bold scale-105 shadow-md shadow-emerald-500/30';
            } else if (isChosen && !isTarget) {
              btnClass = 'bg-rose-600 border-rose-500 text-white font-bold opacity-90 shadow-md shadow-rose-500/30';
            } else {
              btnClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-40';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelect(opt)}
              className={`min-w-16 h-16 sm:min-w-20 sm:h-20 px-5 rounded-2xl border-2 text-2xl sm:text-3xl font-extrabold uppercase transition-all duration-150 cursor-pointer flex flex-col items-center justify-center relative ${btnClass}`}
            >
              <span>{opt}</span>
              <span className="text-[10px] font-normal font-sans opacity-50 absolute bottom-1">
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback & Rule Explanation */}
      {isAnswered && (
        <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
          {isCorrect && autoAdvance && !isPaused && (
            <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" /> Верно! Переход к следующему слову...
              </span>
              <button
                onClick={togglePause}
                className="font-bold underline text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" /> Пауза
              </button>
            </div>
          )}

          <div
            className={`p-5 rounded-2xl border flex items-start gap-4 ${
              isCorrect
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/90 border-rose-200 text-rose-900'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0 border border-slate-200/60">
              {isCorrect ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <X className="w-5 h-5 text-rose-600" />
              )}
            </div>
            <div className="space-y-1">
              <div className="font-bold text-base flex items-center gap-2">
                <span>{isCorrect ? 'Верно:' : 'Ошибка! Правильно:'}</span>
                <span className="font-mono text-lg uppercase font-black px-2 py-0.5 rounded bg-white border border-slate-200/80 shadow-xs">
                  {currentWord.prefix}
                  <span className="underline decoration-2 underline-offset-4 text-emerald-700">{currentWord.target}</span>
                  {currentWord.suffix}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans pt-1">
                💡 {currentWord.rule}
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <span>Следующее слово (Пробел)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
