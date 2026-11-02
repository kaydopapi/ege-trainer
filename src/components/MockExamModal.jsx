import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Trophy, RotateCcw, X } from 'lucide-react';
import { FIPI_GRAMMAR_BANK } from '../data/fipiBank';

export default function MockExamModal({ isOpen, onClose, onFinishExam }) {
  const [examTasks, setExamTasks] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const generated = [
        { taskNum: 4, data: FIPI_GRAMMAR_BANK.task4.examVariants[0], type: 'select' },
        { taskNum: 5, data: FIPI_GRAMMAR_BANK.task5.examTasks[0], type: 'text' },
        { taskNum: 6, data: FIPI_GRAMMAR_BANK.task6.examTasks[0], type: 'text' },
        { taskNum: 7, data: FIPI_GRAMMAR_BANK.task7.examTasks[0], type: 'text' },
        { taskNum: 9, data: FIPI_GRAMMAR_BANK.task9.examTasks[0], type: 'select' },
        { taskNum: 10, data: FIPI_GRAMMAR_BANK.task10.examTasks[0], type: 'select' },
        { taskNum: 11, data: FIPI_GRAMMAR_BANK.task11.examTasks[0], type: 'select' },
        { taskNum: 12, data: FIPI_GRAMMAR_BANK.task12.examTasks[0], type: 'select' },
        { taskNum: 13, data: FIPI_GRAMMAR_BANK.task13.examTasks[0], type: 'select' },
        { taskNum: 15, data: FIPI_GRAMMAR_BANK.task15.examTasks[0], type: 'select' },
        { taskNum: 16, data: FIPI_GRAMMAR_BANK.task16.examTasks[0], type: 'select' },
        { taskNum: 17, data: FIPI_GRAMMAR_BANK.task17.examTasks[0], type: 'select' }
      ];
      setExamTasks(generated);
      setCurrentIdx(0);
      setUserAnswers({});
      setIsCompleted(false);
      setTimeLeft(1800);
      setIsStarted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isStarted || isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, isCompleted]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const current = examTasks[currentIdx];

  const handleAnswerChange = (val) => {
    sounds.playClick();
    setUserAnswers({ ...userAnswers, [currentIdx]: val });
  };

  const handleFinish = () => {
    setIsCompleted(true);
    sounds.playSuccess();
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    if (onFinishExam) {
      let score = 0;
      examTasks.forEach((t, i) => {
        const ans = userAnswers[i]?.trim().toLowerCase();
        const correct = (t.data.answer || t.data.correctAnswer || t.data.correctWord)?.toLowerCase();
        if (ans === correct) score++;
      });
      onFinishExam(score, examTasks.length);
    }
  };

  let correctCount = 0;
  if (isCompleted) {
    examTasks.forEach((t, i) => {
      const ans = userAnswers[i]?.trim().toLowerCase();
      const correct = (t.data.answer || t.data.correctAnswer || t.data.correctWord)?.toLowerCase();
      if (ans === correct) correctCount++;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Пробный вариант ЕГЭ (Тест)</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                12 заданий
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Полноценная симуляция тестовой части по русскому языку
            </p>
          </div>

          <div className="flex items-center gap-4">
            {!isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-mono text-sm font-bold text-amber-800">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Selector Tabs */}
        {!isCompleted && (
          <div className="flex overflow-x-auto gap-2 py-3 border-b border-slate-100 scrollbar-none shrink-0">
            {examTasks.map((t, idx) => {
              const isFilled = !!userAnswers[idx];
              const isCur = currentIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                    isCur
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-105 shadow-xs'
                      : isFilled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold'
                      : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.taskNum}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="py-6 flex-1 overflow-y-auto">
          {!isCompleted ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Задание {currentIdx + 1} из {examTasks.length} (№{current.taskNum})</span>
                <span className="text-indigo-600">Первичный балл: 1</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-base text-slate-900 font-semibold leading-relaxed">
                  {current.data.question || current.data.sentence}
                </p>

                {current.data.rows && (
                  <div className="grid gap-2 pt-2">
                    {current.data.rows.map((r) => (
                      <div key={r.num} className="p-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono flex items-center gap-3 shadow-xs">
                        <span className="text-indigo-600 font-bold">{r.num})</span>
                        <span className="text-slate-800">{r.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {current.data.options && current.data.options[0]?.text && (
                  <div className="grid gap-2 pt-2">
                    {current.data.options.map((o) => (
                      <div key={o.num || o} className="p-2.5 rounded-xl bg-white border border-slate-200 text-sm flex items-center gap-3 shadow-xs">
                        <span className="text-indigo-600 font-bold">{o.num || ''})</span>
                        <span className="text-slate-800 font-mono">{o.text || o}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">
                  Ваш ответ (цифры или слово без пробелов):
                </label>
                <input
                  type="text"
                  value={userAnswers[currentIdx] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Введите ответ"
                  className="w-full bg-white border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3.5 font-mono text-lg text-slate-900 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>

                {currentIdx < examTasks.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <span>Далее</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    Завершить тест
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* RESULTS REVIEW */
            <div className="space-y-6">
              <div className="text-center py-6 space-y-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 text-amber-700 mx-auto flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Результат: {correctCount} из {examTasks.length} баллов
                </h3>
                <p className="text-sm text-slate-600">
                  {correctCount >= 10 ? 'Великолепно! Вы готовы к 90+ баллам на ЕГЭ.' : 'Хороший результат! Повторите ошибочные номера в тренажёре.'}
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Построчный разбор ответов:
                </h4>
                {examTasks.map((t, idx) => {
                  const user = userAnswers[idx]?.trim().toLowerCase();
                  const target = (t.data.answer || t.data.correctAnswer || t.data.correctWord)?.toLowerCase();
                  const isOk = user === target;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                        isOk ? 'bg-emerald-50/80 border-emerald-200 text-slate-900' : 'bg-rose-50/80 border-rose-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-white font-bold text-xs flex items-center justify-center text-slate-700 border border-slate-200 shadow-xs">
                          {t.taskNum}
                        </span>
                        <div className="text-xs">
                          <span className="text-slate-500">Ваш ответ: </span>
                          <span className="font-mono font-bold text-slate-900">{userAnswers[idx] || '—'}</span>
                          {!isOk && (
                            <span className="ml-3 text-emerald-700 font-bold">Правильно: <strong className="font-mono">{target}</strong></span>
                          )}
                        </div>
                      </div>

                      {isOk ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isCompleted && (
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center shrink-0">
            <button
              onClick={() => {
                setUserAnswers({});
                setCurrentIdx(0);
                setIsCompleted(false);
                setTimeLeft(1800);
              }}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Пройти заново</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
