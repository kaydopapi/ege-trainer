import React, { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, Lightbulb, Search, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const TASK_CATEGORIES = [
  {
    name: 'Нормы языка',
    tasks: [
      { id: 'task4', num: '№4', label: 'Ударения' },
      { id: 'task5', num: '№5', label: 'Паронимы' },
      { id: 'task6', num: '№6', label: 'Лексика' },
      { id: 'task7', num: '№7', label: 'Морфология' },
      { id: 'task8', num: '№8', label: 'Синтаксис' }
    ]
  },
  {
    name: 'Орфография',
    tasks: [
      { id: 'task9', num: '№9', label: 'Корни' },
      { id: 'task10', num: '№10', label: 'Приставки' },
      { id: 'task11', num: '№11', label: 'Суффиксы' },
      { id: 'task12', num: '№12', label: 'Окончания' },
      { id: 'task13', num: '№13', label: 'НЕ / НИ' },
      { id: 'task14', num: '№14', label: 'Слитно/Дефис' },
      { id: 'task15', num: '№15', label: 'Н и НН' }
    ]
  },
  {
    name: 'Пунктуация',
    tasks: [
      { id: 'task16', num: '№16', label: 'ССП' },
      { id: 'task17', num: '№17', label: 'Обороты' },
      { id: 'task18', num: '№18', label: 'Вводные слова' },
      { id: 'task19', num: '№19', label: 'СПП' },
      { id: 'task20', num: '№20', label: 'Стык союзов' },
      { id: 'task21', num: '№21', label: 'Анализ знаков' }
    ]
  }
];

export default function TheoryDrawer({ isOpen, onClose, taskData, allTasksData, onSelectTask }) {
  const [selectedTaskId, setSelectedTaskId] = useState('task9');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync selected task when taskData changes
  useEffect(() => {
    if (taskData && taskData.id) {
      const taskId = `task${taskData.id}`;
      setSelectedTaskId(taskId);
    }
  }, [taskData]);

  const currentTask = useMemo(() => {
    if (allTasksData && allTasksData[selectedTaskId]) {
      return allTasksData[selectedTaskId];
    }
    return taskData || (allTasksData ? allTasksData.task9 : null);
  }, [allTasksData, selectedTaskId, taskData]);

  // Global search across all rules when searchQuery is entered
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !allTasksData) return null;
    const query = searchQuery.toLowerCase().trim();
    const results = [];

    Object.entries(allTasksData).forEach(([key, task]) => {
      // Check rules
      if (task.rules) {
        task.rules.forEach((r) => {
          if (
            r.title.toLowerCase().includes(query) ||
            r.text.toLowerCase().includes(query) ||
            (r.examples && r.examples.some((ex) => ex.toLowerCase().includes(query)))
          ) {
            results.push({
              taskKey: key,
              taskTitle: task.title,
              fipiCode: task.fipiCode,
              rule: r
            });
          }
        });
      }

      // Check categories
      if (task.categories) {
        task.categories.forEach((cat) => {
          if (
            cat.name.toLowerCase().includes(query) ||
            cat.items.some((it) => it.correct.toLowerCase().includes(query) || it.tip.toLowerCase().includes(query))
          ) {
            results.push({
              taskKey: key,
              taskTitle: task.title,
              fipiCode: task.fipiCode,
              category: cat
            });
          }
        });
      }

      // Check pleonasms
      if (task.pleonasms) {
        const matchingPleonasms = task.pleonasms.filter(
          (p) => p.phrase.toLowerCase().includes(query) || p.redundant.toLowerCase().includes(query)
        );
        if (matchingPleonasms.length > 0) {
          results.push({
            taskKey: key,
            taskTitle: task.title,
            fipiCode: task.fipiCode,
            pleonasms: matchingPleonasms
          });
        }
      }
    });

    return results;
  }, [searchQuery, allTasksData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 space-y-4 shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">
                    База правил ЕГЭ
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                    ФИПИ + ШКОЛКОВО
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Официальная теория, таблицы, алгоритмы и исключения по всем заданиям №4–21
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Закрыть (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search inside Rules */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Найти правило (чередование, деепричастие, пре/при, паронимы, н/нн)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Task Quick-Selector Pills */}
          {!searchQuery && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Выберите задание для изучения:</span>
                <span className="text-indigo-600 font-extrabold">{currentTask?.fipiCode || ''}</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {TASK_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="flex gap-1 shrink-0 items-center pr-2 border-r border-slate-100 last:border-0">
                    {cat.tasks.map((t) => {
                      const isActive = selectedTaskId === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 scale-102'
                              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                          }`}
                        >
                          {t.num}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SEARCH RESULTS MODE */}
          {searchQuery ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Найдено совпадений: {searchResults ? searchResults.length : 0}</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-600 hover:underline cursor-pointer"
                >
                  Очистить поиск
                </button>
              </div>

              {searchResults && searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-black">
                        {item.fipiCode}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTaskId(item.taskKey);
                          setSearchQuery('');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Перейти к теме</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.rule && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{item.rule.title}</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {item.rule.text}
                        </p>
                        {item.rule.examples && (
                          <div className="pt-1 flex flex-wrap gap-1.5">
                            {item.rule.examples.map((ex, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-emerald-700">
                                {ex}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {item.category && (
                      <div className="space-y-2">
                        <span className="font-extrabold text-indigo-700 text-xs">{item.category.name}</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {item.category.items.map((it, j) => (
                            <div key={j} className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-emerald-700 font-bold block">{it.correct}</span>
                              <span className="text-slate-500 block text-[10px] mt-0.5">{it.tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.pleonasms && (
                      <div className="space-y-2">
                        <span className="font-extrabold text-rose-700 text-xs">Плеоназмы (лишние слова):</span>
                        <div className="grid gap-1.5">
                          {item.pleonasms.map((p, j) => (
                            <div key={j} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex justify-between">
                              <span className="text-slate-800">{p.phrase}</span>
                              <span className="text-rose-700 font-bold">Лишнее: {p.redundant}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">Ничего не найдено по запросу «{searchQuery}»</p>
                  <p className="text-xs">Попробуйте ввести часть слова (например, «черед» или «дееприч»)</p>
                </div>
              )}
            </div>
          ) : (
            /* STANDARD TASK RULES VIEW */
            <div className="space-y-6">
              {/* Task Header Banner */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                    {currentTask?.fipiCode}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    {currentTask?.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentTask?.description}
                  </p>
                </div>

                {onSelectTask && (
                  <button
                    onClick={() => {
                      onSelectTask(selectedTaskId);
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <span>К тренажёру</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Rules Cards */}
              {currentTask?.rules && currentTask.rules.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Свод правил и алгоритмов:</span>
                  </h5>

                  {currentTask.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm sm:text-base">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{rule.title}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                        {rule.text}
                      </p>

                      {rule.examples && rule.examples.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">
                            Примеры из вариантов ФИПИ:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {rule.examples.map((ex, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-emerald-800 shadow-2xs"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Morphology Categories */}
              {currentTask?.categories && (
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Ключевые трудные случаи (шпаргалка):
                  </h5>
                  {currentTask.categories.map((cat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                      <span className="font-extrabold text-indigo-900 text-sm block">{cat.name}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                        {cat.items.map((it, j) => (
                          <div key={j} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-emerald-700 font-bold block">{it.correct}</span>
                            <span className="text-rose-600 line-through text-[11px] block">{it.wrong}</span>
                            <span className="text-slate-500 block text-[10px] mt-1">{it.tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paronyms Pairs */}
              {currentTask?.paronymPairs && (
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Популярные пары паронимов из словника ФИПИ:
                  </h5>
                  <div className="grid gap-3">
                    {currentTask.paronymPairs.map((p, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                            {p.pair[0]}
                          </span>
                          <span className="text-slate-400 font-bold">vs</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                            {p.pair[1]}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          <strong>{p.pair[0]}:</strong> {p.defs[p.pair[0]]}
                          <br />
                          <strong>{p.pair[1]}:</strong> {p.defs[p.pair[1]]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pleonasms list */}
              {currentTask?.pleonasms && (
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Словарь плеоназмов (исключить лишнее слово):
                  </h5>
                  <div className="grid gap-2">
                    {currentTask.pleonasms.map((p, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                        <span className="text-slate-800 font-semibold">{p.phrase}</span>
                        <span className="text-rose-700 font-bold">Лишнее: {p.redundant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer shadow-md text-center"
          >
            Закрыть шпаргалку
          </button>
        </div>
      </div>
    </div>
  );
}
