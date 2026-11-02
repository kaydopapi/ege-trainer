import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { BookOpen, Check, X, ArrowRight, Zap, FileSpreadsheet } from 'lucide-react';

const VOWELS = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];

export default function StressTrainer({ data, onResult, onOpenTheory }) {
  const [subMode, setSubMode] = useState('blitz'); // 'blitz' | 'exam'
  
  // Blitz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCharIndex, setSelectedCharIndex] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledWords, setShuffledWords] = useState([]);

  // Exam state
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [selectedExamOptions, setSelectedExamOptions] = useState([]);
  const [isExamChecked, setIsExamChecked] = useState(false);

  useEffect(() => {
    setShuffledWords([...data.words].sort(() => Math.random() - 0.5));
  }, [data]);

  const currentWord = shuffledWords[currentIndex] || data.words[0];
  const currentExam = data.examVariants[currentExamIndex] || data.examVariants[0];

  const handleLetterClick = (char, idx) => {
    if (isAnswered) return;
    const isVowel = VOWELS.includes(char.toLowerCase());
    if (!isVowel) return;

    setSelectedCharIndex(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentWord.stressedIdx;

    if (isCorrect) {
      sounds.playSuccess();
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      sounds.playError();
    }

    onResult(isCorrect, {
      id: `stress-${currentWord.word}`,
      taskId: 4,
      title: "Задание №4 (Ударения)",
      question: `Укажите верное ударение в слове: ${currentWord.word}`,
      userAnswer: char.toUpperCase(),
      correctAnswer: currentWord.correct,
      explanation: currentWord.comment
    });
  };

  const handleNextWord = () => {
    setSelectedCharIndex(null);
    setIsAnswered(false);
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShuffledWords([...data.words].sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
    }
  };

  const toggleExamOption = (num) => {
    if (isExamChecked) return;
    sounds.playClick();
    if (selectedExamOptions.includes(num)) {
      setSelectedExamOptions(selectedExamOptions.filter((n) => n !== num));
    } else {
      setSelectedExamOptions([...selectedExamOptions, num].sort());
    }
  };

  const handleCheckExam = () => {
    if (isExamChecked || selectedExamOptions.length === 0) return;
    setIsExamChecked(true);
    const userAnswerStr = selectedExamOptions.sort().join('');
    const isCorrect = userAnswerStr === currentExam.answer;

    if (isCorrect) {
      sounds.playSuccess();
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.7 } });
    } else {
      sounds.playError();
    }

    onResult(isCorrect, {
      id: currentExam.id,
      taskId: 4,
      title: "Задание №4 (Формат ЕГЭ)",
      question: currentExam.question,
      userAnswer: userAnswerStr,
      correctAnswer: currentExam.answer,
      explanation: currentExam.explanation
    });
  };

  const handleNextExam = () => {
    setIsExamChecked(false);
    setSelectedExamOptions([]);
    setCurrentExamIndex((prev) => (prev + 1) % data.examVariants.length);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Submode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => { setSubMode('blitz'); setIsAnswered(false); setSelectedCharIndex(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subMode === 'blitz'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Клик по ударению</span>
          </button>
          <button
            onClick={() => { setSubMode('exam'); setIsExamChecked(false); setSelectedExamOptions([]); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              subMode === 'exam'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Формат ЕГЭ (5 строк)</span>
          </button>
        </div>

        <button
          onClick={onOpenTheory}
          className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Шпаргалка к №4</span>
        </button>
      </div>

      {subMode === 'blitz' ? (
        /* BLITZ MODE */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Словник ФИПИ • {currentWord.pos.toUpperCase()}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Нажмите на гласную букву, на которую падает ударение
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Слово <strong className="text-slate-800 font-bold">{currentIndex + 1}</strong> из {shuffledWords.length || data.words.length}
            </p>
          </div>

          {/* Word interactive letters */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-8">
            {currentWord.word.split('').map((char, idx) => {
              const isVowel = VOWELS.includes(char.toLowerCase());
              const isSelected = selectedCharIndex === idx;
              const isStressedTarget = currentWord.stressedIdx === idx;

              let btnStyle = "bg-slate-50 text-slate-400 border-slate-200 cursor-default";
              if (isVowel) {
                if (!isAnswered) {
                  btnStyle = "bg-white hover:bg-indigo-50 hover:border-indigo-400 text-slate-900 hover:text-indigo-700 hover:scale-105 active:scale-95 border-slate-300 shadow-sm cursor-pointer";
                } else {
                  if (isStressedTarget) {
                    btnStyle = "bg-emerald-600 text-white border-emerald-500 ring-4 ring-emerald-100 font-black scale-110 shadow-md shadow-emerald-500/30";
                  } else if (isSelected && !isStressedTarget) {
                    btnStyle = "bg-rose-600 text-white border-rose-500 ring-4 ring-rose-100 font-bold scale-105 shadow-md shadow-rose-500/30";
                  } else {
                    btnStyle = "bg-slate-50 text-slate-400 border-slate-200 opacity-50";
                  }
                }
              }

              return (
                <button
                  key={idx}
                  disabled={!isVowel || isAnswered}
                  onClick={() => handleLetterClick(char, idx)}
                  className={`w-12 h-16 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-mono uppercase transition-all duration-200 border-2 ${btnStyle}`}
                >
                  {isAnswered && isStressedTarget ? char.toUpperCase() : char}
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanation */}
          {isAnswered && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
              <div
                className={`p-5 rounded-2xl border flex items-start gap-4 ${
                  selectedCharIndex === currentWord.stressedIdx
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/90 border-rose-200 text-rose-900'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0 border border-slate-200/60">
                  {selectedCharIndex === currentWord.stressedIdx ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <X className="w-5 h-5 text-rose-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-base flex items-center gap-2">
                    <span>Правильно:</span>
                    <span className="font-mono text-emerald-700 text-xl font-black bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentWord.correct}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                    💡 {currentWord.comment}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={handleNextWord}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>Следующее слово (Пробел)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* EXAM MODE */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              Прототип ФИПИ • Задание №4
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {currentExam.question}
            </h3>
          </div>

          <div className="grid gap-3">
            {currentExam.options.map((opt) => {
              const isSelected = selectedExamOptions.includes(opt.num);
              let optionStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs';

              if (isExamChecked) {
                if (opt.isCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                } else if (isSelected && !opt.isCorrect) {
                  optionStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                } else {
                  optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-2 ring-indigo-100';
              }

              return (
                <div
                  key={opt.num}
                  onClick={() => toggleExamOption(opt.num)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600">
                      {opt.num}
                    </span>
                    <span className="text-xl font-mono tracking-wide">{opt.text}</span>
                  </div>

                  {isExamChecked && (
                    <div className="text-xs font-bold">
                      {opt.isCorrect ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <Check className="w-4 h-4 text-emerald-600" /> Верно
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1">
                          <X className="w-4 h-4 text-rose-600" /> Надо: {opt.correctWord}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom actions */}
          {!isExamChecked ? (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Выбрано вариантов: <span className="text-indigo-600 font-extrabold">{selectedExamOptions.length}</span>
              </div>
              <button
                disabled={selectedExamOptions.length === 0}
                onClick={handleCheckExam}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Проверить ответ
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed space-y-1">
                <div className="font-extrabold text-slate-900">Правильный ответ: {currentExam.answer}</div>
                <p className="text-slate-600">{currentExam.explanation}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNextExam}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Следующий вариант</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
