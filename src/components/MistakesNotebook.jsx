import React, { useState, useEffect } from 'react';
import { loadMistakes, removeMistake } from '../utils/storage';
import { sounds } from '../utils/audio';
import { Check, Trash2, AlertCircle, Sparkles, X } from 'lucide-react';

export default function MistakesNotebook({ isOpen, onClose }) {
  const [mistakes, setMistakes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMistakes(loadMistakes());
      setCurrentIndex(0);
      setIsAnswered(false);
      setUserAnswer('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentItem = mistakes[currentIndex];

  const handleVerify = () => {
    if (!currentItem || !userAnswer.trim()) return;
    setIsAnswered(true);

    const isCorrect = userAnswer.trim().toLowerCase() === currentItem.correctAnswer.toLowerCase();
    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  const handleResolveAndNext = () => {
    if (currentItem) {
      const updated = removeMistake(currentItem.id, currentItem.taskId);
      setMistakes(updated);
    }
    setIsAnswered(false);
    setUserAnswer('');
    if (currentIndex >= mistakes.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleClearAll = () => {
    localStorage.removeItem('ege_trainer_mistakes_v2');
    setMistakes([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Работа над ошибками</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200">
                  {mistakes.length} вопросов
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Задания, в которых вы допустили ошибки во время тренировок
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 flex-1 overflow-y-auto space-y-6">
          {mistakes.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Ваша тетрадь ошибок пуста!
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Отличная работа! Сюда будут сохраняться задания, в которых вы ошибётесь при тренировке, чтобы вы могли повторить их до идеала.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Вопрос {currentIndex + 1} из {mistakes.length}</span>
                <span className="text-indigo-600">{currentItem.title}</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-base font-semibold text-slate-900">
                  {currentItem.question}
                </div>
                {currentItem.userAnswer && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl font-medium">
                    Ваш прошлый ответ был: <span className="font-mono font-bold">{currentItem.userAnswer}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">
                  Попробуйте ответить снова:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    disabled={isAnswered}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder="Введите правильный ответ"
                    className="flex-1 bg-white border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3 font-mono text-slate-900 outline-none shadow-xs"
                  />
                  {!isAnswered ? (
                    <button
                      disabled={!userAnswer.trim()}
                      onClick={handleVerify}
                      className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      Проверить
                    </button>
                  ) : (
                    <button
                      onClick={handleResolveAndNext}
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Check className="w-5 h-5" />
                      <span>Усвоено! Дальше</span>
                    </button>
                  )}
                </div>
              </div>

              {isAnswered && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-2">
                  <div className="font-bold text-slate-900">
                    Правильный ответ: <span className="text-emerald-700 font-mono font-black">{currentItem.correctAnswer}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    💡 {currentItem.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {mistakes.length > 0 && (
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center shrink-0">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Очистить все ошибки</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
