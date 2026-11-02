import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { ORTHOGRAPHY_WORDS } from '../data/orthographyWords';
import SingleWordTrainer from './SingleWordTrainer';
import { BookOpen, Check, X, ArrowRight, Zap, FileSpreadsheet } from 'lucide-react';

export default function OrthographyTrainer({ taskData, onResult, onOpenTheory }) {
  const wordsForTask = ORTHOGRAPHY_WORDS[`task${taskData.id}`];
  const hasSingleWords = Boolean(wordsForTask && wordsForTask.length > 0);

  const [mode, setMode] = useState(hasSingleWords ? 'single' : 'exam');
  const [taskIndex, setTaskIndex] = useState(0);
  const [selectedNums, setSelectedNums] = useState([]);
  const [isChecked, setIsChecked] = useState(false);

  const currentTask = taskData.examTasks[taskIndex] || taskData.examTasks[0];

  const toggleNum = (num) => {
    if (isChecked) return;
    sounds.playClick();
    if (selectedNums.includes(num)) {
      setSelectedNums(selectedNums.filter((n) => n !== num));
    } else {
      setSelectedNums([...selectedNums, num].sort());
    }
  };

  const handleCheck = () => {
    if (isChecked || selectedNums.length === 0) return;
    setIsChecked(true);

    const userStr = selectedNums.sort().join('');
    const isCorrect = userStr === currentTask.answer;

    if (isCorrect) {
      sounds.playSuccess();
      confetti({ particleCount: 35, spread: 65, origin: { y: 0.7 } });
    } else {
      sounds.playError();
    }

    onResult(isCorrect, {
      id: currentTask.id,
      taskId: taskData.id,
      title: taskData.title,
      question: currentTask.question,
      userAnswer: userStr,
      correctAnswer: currentTask.answer,
      explanation: currentTask.explanation
    });
  };

  const handleNext = () => {
    setIsChecked(false);
    setSelectedNums([]);
    setTaskIndex((prev) => (prev + 1) % taskData.examTasks.length);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            Банк ФИПИ • {taskData.fipiCode}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            {taskData.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {hasSingleWords && (
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setMode('single')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === 'single'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Одно слово</span>
              </button>
              <button
                onClick={() => setMode('exam')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === 'exam'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Формат ЕГЭ</span>
              </button>
            </div>
          )}

          <button
            onClick={onOpenTheory}
            className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Правило</span>
          </button>
        </div>
      </div>

      {/* Render Single Word Mode */}
      {mode === 'single' && hasSingleWords ? (
        <SingleWordTrainer
          words={wordsForTask}
          taskTitle={taskData.title}
          taskId={taskData.id}
          onResult={onResult}
          onOpenTheory={onOpenTheory}
        />
      ) : (
        /* Render Standard Exam Mode */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-bold text-slate-900">
              {currentTask.question}
            </p>
            {currentTask.sentence && (
              <div className="p-5 my-3 rounded-2xl bg-slate-50 border border-slate-200 text-base sm:text-lg leading-relaxed text-slate-800">
                {currentTask.sentence}
              </div>
            )}
          </div>

          {/* Rows (Tasks 9, 10, 11, 12) */}
          {currentTask.rows && (
            <div className="grid gap-3">
              {currentTask.rows.map((row) => {
                const isSelected = selectedNums.includes(row.num);
                let rowStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs';

                if (isChecked) {
                  if (row.isMatch) {
                    rowStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                  } else if (isSelected && !row.isMatch) {
                    rowStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                  } else {
                    rowStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  rowStyle = 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-2 ring-indigo-100';
                }

                return (
                  <div
                    key={row.num}
                    onClick={() => toggleNum(row.num)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${rowStyle}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0">
                        {row.num}
                      </span>
                      <span className="text-base sm:text-lg font-mono font-medium tracking-wide">
                        {row.text}
                      </span>
                    </div>

                    {isChecked && (
                      <div className="text-xs sm:text-sm font-bold shrink-0">
                        {row.isMatch ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-600" /> Буква: «{row.missing.toUpperCase()}»
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1">
                            <X className="w-4 h-4 text-rose-600" /> Разные буквы ({row.missing})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Options (Tasks 13, 14) */}
          {currentTask.options && (
            <div className="grid gap-3">
              {currentTask.options.map((opt) => {
                const isSelected = selectedNums.includes(opt.num);
                let style = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs';

                if (isChecked) {
                  if (opt.isCorrect) {
                    style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                  } else if (isSelected && !opt.isCorrect) {
                    style = 'bg-rose-50 border-rose-400 text-rose-900';
                  } else {
                    style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  style = 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-2 ring-indigo-100';
                }

                return (
                  <div
                    key={opt.num}
                    onClick={() => toggleNum(opt.num)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${style}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0">
                        {opt.num}
                      </span>
                      <span className="text-base sm:text-lg font-medium">
                        {opt.text}
                      </span>
                    </div>

                    {isChecked && (
                      <div className="text-xs sm:text-sm font-bold shrink-0">
                        {opt.isCorrect ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-600" /> Подходит
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1">
                            <X className="w-4 h-4 text-rose-600" /> Не подходит
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Positions (Task 15) */}
          {currentTask.positions && (
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {currentTask.positions.map((pos) => {
                const isSelected = selectedNums.includes(pos.num);
                let style = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs';

                if (isChecked) {
                  const isTarget = currentTask.answer.includes(String(pos.num));
                  if (isTarget) {
                    style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                  } else if (isSelected && !isTarget) {
                    style = 'bg-rose-50 border-rose-400 text-rose-900';
                  } else {
                    style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  style = 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-2 ring-indigo-100';
                }

                return (
                  <div
                    key={pos.num}
                    onClick={() => toggleNum(pos.num)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700">
                        ({pos.num})
                      </span>
                      <span className="font-mono text-base font-bold">{pos.word}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{pos.count} Н</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Bar */}
          {!isChecked ? (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Выбранные цифры: <span className="font-mono font-bold text-indigo-600 text-lg">{selectedNums.join('') || '—'}</span>
              </div>
              <button
                disabled={selectedNums.length === 0}
                onClick={handleCheck}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Проверить ответ
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed space-y-2">
                <div className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <span>Правильный ответ:</span>
                  <span className="font-mono text-emerald-700 text-lg px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 font-bold">
                    {currentTask.answer}
                  </span>
                </div>
                <p className="whitespace-pre-line text-slate-700">{currentTask.explanation}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <span>Следующее задание</span>
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
