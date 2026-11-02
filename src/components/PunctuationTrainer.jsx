import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { BookOpen, Check, X, ArrowRight } from 'lucide-react';

export default function PunctuationTrainer({ taskData, onResult, onOpenTheory }) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            Банк ФИПИ • {taskData.fipiCode}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {taskData.title}
          </h2>
        </div>

        <button
          onClick={onOpenTheory}
          className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Шпаргалка к правилу</span>
        </button>
      </div>

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

        {/* Sentences (Tasks 16, 21) */}
        {currentTask.sentences && (
          <div className="grid gap-3">
            {currentTask.sentences.map((sent) => {
              const isSelected = selectedNums.includes(sent.num);
              let style = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs';

              if (isChecked) {
                const isTarget = currentTask.answer.includes(String(sent.num));
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
                  key={sent.num}
                  onClick={() => toggleNum(sent.num)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${style}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700 shrink-0">
                      {sent.num}
                    </span>
                    <span className="text-base font-medium leading-relaxed">
                      {sent.text}
                    </span>
                  </div>

                  {isChecked && sent.commasCount !== undefined && (
                    <span className="text-xs font-bold text-slate-500 shrink-0">
                      Запятых: {sent.commasCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Positions inside sentence (Tasks 17, 18, 19, 20) */}
        {currentTask.positions && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
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
                <button
                  key={pos.num}
                  onClick={() => toggleNum(pos.num)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center font-bold text-base sm:text-lg ${style}`}
                >
                  Позиция ({pos.num})
                </button>
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
    </div>
  );
}
