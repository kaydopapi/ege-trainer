import React from 'react';
import { Award, Flame, CheckCircle2, XCircle, Volume2, VolumeX, Sparkles, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { calculateLevel } from '../utils/storage';

export default function StatsBar({
  stats,
  mistakesCount,
  onReset,
  soundEnabled,
  onToggleSound,
  onOpenMockExam,
  onOpenSearch,
  onOpenMistakes,
  onOpenTheory,
  onStartMegaSprint
}) {
  const total = stats.correctCount + stats.wrongCount;
  const accuracy = total > 0 ? Math.round((stats.correctCount / total) * 100) : 0;
  const levelInfo = calculateLevel(stats.xp);

  return (
    <div className="space-y-3.5">
      {/* Upper bar: Stats & Level */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Level badge & Progress */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-xl text-white shadow-md shadow-orange-500/25 shrink-0">
            {levelInfo.level}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">{levelInfo.title}</span>
              <span className="text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full font-bold">
                {stats.xp} XP
              </span>
            </div>
            <div className="w-36 sm:w-48 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.percent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Center: Live Metrics */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Серия</div>
              <div className="text-lg font-black text-slate-900">{stats.streak} <span className="text-xs text-amber-500">🔥</span></div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Верно</div>
              <div className="text-lg font-black text-emerald-600">{stats.correctCount}</div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Точность</div>
              <div className="text-lg font-black text-indigo-600">{accuracy}%</div>
            </div>
          </div>
        </div>

        {/* Right: Sound & Reset */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {total > 0 && (
            <button
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Сброс
            </button>
          )}
        </div>
      </div>

      {/* Action Shortcut Pills */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onStartMegaSprint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-100" />
          <span>⚡ Спринт по словам (Вставь букву)</span>
        </button>

        <button
          onClick={onOpenMockExam}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>📝 Пробный вариант (Тест)</span>
        </button>

        <button
          onClick={onOpenTheory}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>📚 База правил (№4–21)</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>🔍 Поиск по словарям</span>
        </button>

        <button
          onClick={onOpenMistakes}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50/60 border border-slate-200 text-slate-700 hover:text-rose-700 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
        >
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>Тетрадь ошибок</span>
          {mistakesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
              {mistakesCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
