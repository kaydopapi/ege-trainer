import React, { useState } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { FIPI_GRAMMAR_BANK } from '../data/fipiBank';

export default function DictionarySearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  // Flatten dictionary items
  const allEntries = [];

  // 1. Task 4 words
  if (FIPI_GRAMMAR_BANK.task4?.words) {
    FIPI_GRAMMAR_BANK.task4.words.forEach((w) => {
      allEntries.push({
        type: 'Ударение (№4)',
        title: w.correct,
        subtitle: `${w.pos.toUpperCase()} • ${w.comment}`,
        searchKey: `${w.word} ${w.correct} ${w.comment}`
      });
    });
  }

  // 2. Task 5 paronyms
  if (FIPI_GRAMMAR_BANK.task5?.paronymPairs) {
    FIPI_GRAMMAR_BANK.task5.paronymPairs.forEach((p) => {
      const defsStr = Object.entries(p.defs).map(([k, v]) => `${k}: ${v}`).join(' | ');
      allEntries.push({
        type: 'Паронимы (№5)',
        title: p.pair.join(' / '),
        subtitle: defsStr,
        searchKey: `${p.pair.join(' ')} ${defsStr}`
      });
    });
  }

  // 3. Task 6 pleonasms
  if (FIPI_GRAMMAR_BANK.task6?.pleonasms) {
    FIPI_GRAMMAR_BANK.task6.pleonasms.forEach((pl) => {
      allEntries.push({
        type: 'Плеоназм (№6)',
        title: pl.phrase,
        subtitle: `Лишнее слово: «${pl.redundant}» • ${pl.explanation}`,
        searchKey: `${pl.phrase} ${pl.redundant} ${pl.explanation}`
      });
    });
  }

  // 4. Task 7 morphology
  if (FIPI_GRAMMAR_BANK.task7?.categories) {
    FIPI_GRAMMAR_BANK.task7.categories.forEach((cat) => {
      cat.items.forEach((it) => {
        allEntries.push({
          type: 'Морфология (№7)',
          title: it.correct,
          subtitle: `НЕЛЬЗЯ: ${it.wrong} • ${it.tip}`,
          searchKey: `${it.correct} ${it.wrong} ${it.tip}`
        });
      });
    });
  }

  const results = query.trim()
    ? allEntries.filter((e) => e.searchKey.toLowerCase().includes(query.toLowerCase())).slice(0, 30)
    : allEntries.slice(0, 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Поиск по Словникам и Правилам ФИПИ
              </h2>
              <p className="text-xs text-slate-500">
                Мгновенный поиск ударений, паронимов, словарных форм и правил
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

        {/* Search Input */}
        <div className="pt-4 shrink-0">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Начните вводить слово (например: жалюзи, надеть, туфель, торт)..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-base shadow-xs"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="py-4 flex-1 overflow-y-auto space-y-2.5 mt-2">
          {results.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Ничего не найдено по запросу «{query}». Попробуйте другое слово.
            </div>
          ) : (
            results.map((res, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all space-y-1 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-lg text-emerald-700 font-mono">
                    {res.title}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {res.type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {res.subtitle}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
