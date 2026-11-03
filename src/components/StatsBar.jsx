import React from 'react';
import { Award, Flame, CheckCircle2, Volume2, VolumeX, Sparkles, AlertCircle, FileText } from 'lucide-react';
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
    <div className="space-y-3">
      {/* Upper bar: Stats & Level */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Level badge & Progress */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-[#2b2b33] flex items-center justify-center font-black text-lg text-white shrink-0">
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
        <div className="stats-metrics flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-[#f8efd9] text-[#9a6a24] border border-[#ead9ad]">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Серия</div>
              <div className="text-lg font-black text-slate-900">{stats.streak} <span className="text-xs text-amber-500">🔥</span></div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-[#e1f0ed] text-[#397b72] border border-[#c4e0da]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Верно</div>
              <div className="text-lg font-black text-emerald-600">{stats.correctCount}</div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-[#f9e9e6] text-[#a6504d] border border-[#f0d4cf]">
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
            className="p-2 rounded-md bg-[#f4f2ef] hover:bg-[#ece9e5] text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
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

    </div>
  );
}
