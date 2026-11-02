import React, { useState, useEffect } from 'react';
import { FIPI_GRAMMAR_BANK } from './data/fipiBank';
import { ORTHOGRAPHY_WORDS } from './data/orthographyWords';
import { loadUserStats, saveUserStats, addMistake, loadMistakes } from './utils/storage';
import { sounds } from './utils/audio';

import StatsBar from './components/StatsBar';
import SingleWordTrainer from './components/SingleWordTrainer';
import StressTrainer from './components/StressTrainer';
import ParonymsTrainer from './components/ParonymsTrainer';
import LexicsTrainer from './components/LexicsTrainer';
import MorphologyTrainer from './components/MorphologyTrainer';
import SyntaxTrainer from './components/SyntaxTrainer';
import OrthographyTrainer from './components/OrthographyTrainer';
import PunctuationTrainer from './components/PunctuationTrainer';

import TheoryDrawer from './components/TheoryDrawer';
import MockExamModal from './components/MockExamModal';
import DictionarySearchModal from './components/DictionarySearchModal';
import MistakesNotebook from './components/MistakesNotebook';

import { GraduationCap, BookMarked, Search, Layers, FileText, ArrowUpRight, BookOpenCheck, PenLine, MessageCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', title: 'Все задания' },
  { id: 'norms', title: '🗣️ Нормы языка (№4–8)' },
  { id: 'orthography', title: '✍️ Орфография (№9–15)' },
  { id: 'punctuation', title: '📍 Пунктуация (№16–21)' }
];

const TASK_LIST = [
  { id: 'sprint_all', category: 'all', num: '⚡', title: 'Спринт по словам', color: 'from-amber-500 to-orange-500' },
  { id: 'task4', category: 'norms', num: '№4', title: 'Ударения', color: 'from-amber-500 to-orange-500' },
  { id: 'task5', category: 'norms', num: '№5', title: 'Паронимы', color: 'from-sky-500 to-blue-500' },
  { id: 'task6', category: 'norms', num: '№6', title: 'Лексика', color: 'from-violet-500 to-purple-500' },
  { id: 'task7', category: 'norms', num: '№7', title: 'Морфология', color: 'from-emerald-500 to-teal-500' },
  { id: 'task8', category: 'norms', num: '№8', title: 'Синтаксис', color: 'from-rose-500 to-pink-500' },
  { id: 'task9', category: 'orthography', num: '№9', title: 'Корни', color: 'from-indigo-500 to-cyan-500' },
  { id: 'task10', category: 'orthography', num: '№10', title: 'Приставки', color: 'from-blue-500 to-indigo-500' },
  { id: 'task11', category: 'orthography', num: '№11', title: 'Суффиксы', color: 'from-cyan-500 to-teal-500' },
  { id: 'task12', category: 'orthography', num: '№12', title: 'Окончания', color: 'from-teal-500 to-emerald-500' },
  { id: 'task13', category: 'orthography', num: '№13', title: 'НЕ / НИ', color: 'from-amber-500 to-yellow-500' },
  { id: 'task14', category: 'orthography', num: '№14', title: 'Слитно / Дефис', color: 'from-orange-500 to-rose-500' },
  { id: 'task15', category: 'orthography', num: '№15', title: 'Н и НН', color: 'from-purple-500 to-pink-500' },
  { id: 'task16', category: 'punctuation', num: '№16', title: 'ССП', color: 'from-rose-500 to-red-500' },
  { id: 'task17', category: 'punctuation', num: '№17', title: 'Обороты', color: 'from-red-500 to-amber-500' },
  { id: 'task18', category: 'punctuation', num: '№18', title: 'Вводные слова', color: 'from-orange-500 to-emerald-500' },
  { id: 'task19', category: 'punctuation', num: '№19', title: 'СПП', color: 'from-emerald-500 to-teal-500' },
  { id: 'task20', category: 'punctuation', num: '№20', title: 'Стык союзов', color: 'from-teal-500 to-blue-500' },
  { id: 'task21', category: 'punctuation', num: '№21', title: 'Анализ знаков', color: 'from-blue-500 to-indigo-500' }
];

const THEORY_GROUPS = [
  {
    id: 'norms',
    eyebrow: '№4–8',
    title: 'Нормы языка',
    text: 'Ударения, паронимы, лексика, формы слов и грамматические ошибки.',
    icon: MessageCircle,
    accent: 'rose'
  },
  {
    id: 'orthography',
    eyebrow: '№9–15',
    title: 'Орфография',
    text: 'Корни, приставки, суффиксы, НЕ/НИ и написание Н и НН.',
    icon: PenLine,
    accent: 'amber'
  },
  {
    id: 'punctuation',
    eyebrow: '№16–21',
    title: 'Пунктуация',
    text: 'Обороты, сложные предложения, вводные слова и анализ знаков.',
    icon: BookOpenCheck,
    accent: 'teal'
  }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTaskId, setActiveTaskId] = useState('sprint_all'); // Default directly to Sprint as user requested!
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [mockExamOpen, setMockExamOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mistakesOpen, setMistakesOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [stats, setStats] = useState(loadUserStats());
  const [mistakesList, setMistakesList] = useState(loadMistakes());

  useEffect(() => {
    saveUserStats(stats);
  }, [stats]);

  // Keyboard shortcut: / or Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  const handleResult = (isCorrect, mistakePayload) => {
    setStats((prev) => {
      const earnedXP = isCorrect ? 15 + Math.min(30, prev.streak * 3) : 0;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        ...prev,
        xp: prev.xp + earnedXP,
        totalSolved: prev.totalSolved + 1,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak || 0, newStreak)
      };
    });

    if (!isCorrect && mistakePayload) {
      addMistake(mistakePayload);
      setMistakesList(loadMistakes());
    }
  };

  const handleFinishExam = (score, total) => {
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + score * 25,
      totalSolved: prev.totalSolved + total,
      correctCount: prev.correctCount + score,
      wrongCount: prev.wrongCount + (total - score)
    }));
  };

  const handleResetStats = () => {
    const fresh = {
      xp: 0,
      totalSolved: 0,
      correctCount: 0,
      wrongCount: 0,
      streak: 0,
      bestStreak: 0,
      taskStats: {}
    };
    setStats(fresh);
    saveUserStats(fresh);
  };

  const filteredTasks = activeCategory === 'all'
    ? TASK_LIST
    : TASK_LIST.filter((t) => t.category === activeCategory);

  const currentTaskData = FIPI_GRAMMAR_BANK[activeTaskId] || FIPI_GRAMMAR_BANK.task9;

  return (
    <div className="app-shell min-h-screen text-slate-900 flex flex-col justify-between selection:bg-rose-500 selection:text-white">

      {/* Top Navbar */}
      <header className="site-header border-b border-slate-200/80 bg-white/92 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  Русский без пробелов
                </h1>
                <span className="hidden sm:inline-block meta-chip">
                  ЕГЭ · 2026
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Теория и практика в одном маршруте
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="header-action"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Поиск</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-white text-slate-500 font-mono border border-slate-200">⌘K</kbd>
            </button>

            <button
              onClick={() => setTheoryOpen(true)}
              className="header-action header-action-primary"
            >
              <BookMarked className="w-4 h-4" />
              <span>Теория</span>
              <span className="hidden sm:inline-block">№4–21</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-7 flex-1">
        <section className="intro-panel">
          <div className="max-w-2xl">
            <p className="section-kicker">Маршрут подготовки</p>
            <h2>Готовься к тестовой части <em>с пониманием.</em></h2>
            <p className="intro-copy">
              Разбирай правило, сразу закрепляй его в тренажёре и возвращайся к ошибкам,
              пока ответ не станет уверенным.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => setTheoryOpen(true)} className="primary-cta">
                <BookMarked className="w-4 h-4" /> Открыть базу правил <ArrowUpRight className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTaskId('sprint_all')} className="secondary-cta">
                Начать тренировку
              </button>
            </div>
          </div>
          <div className="intro-note">
            <span className="intro-note-line"></span>
            <p>№4–21</p>
            <strong>21 тема</strong>
            <span>в одном спокойном интерфейсе</span>
          </div>
        </section>

        {/* User Stats and Quick Actions Bar */}
        <StatsBar
          stats={stats}
          mistakesCount={mistakesList.length}
          onReset={handleResetStats}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onStartMegaSprint={() => {
            sounds.playClick();
            setActiveTaskId('sprint_all');
          }}
          onOpenMockExam={() => setMockExamOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMistakes={() => setMistakesOpen(true)}
          onOpenTheory={() => setTheoryOpen(true)}
        />

        <section className="space-y-3">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Сначала теория</p>
              <h3>Собери целостную картину правил</h3>
            </div>
            <button className="text-link" onClick={() => setTheoryOpen(true)}>Вся теория <ArrowUpRight className="w-4 h-4" /></button>
          </div>
          <div className="theory-grid">
            {THEORY_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <button
                  key={group.id}
                  className={`theory-card theory-card-${group.accent}`}
                  onClick={() => { setActiveCategory(group.id); setTheoryOpen(true); }}
                >
                  <span className="theory-card-icon"><Icon className="w-5 h-5" /></span>
                  <span className="theory-card-copy">
                    <span className="theory-card-eyebrow">{group.eyebrow}</span>
                    <strong>{group.title}</strong>
                    <span>{group.text}</span>
                  </span>
                  <ArrowUpRight className="theory-card-arrow w-4 h-4" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs hover:bg-slate-50'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Task Horizontal Scroller */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
          {filteredTasks.map((t) => {
            const isActive = activeTaskId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveTaskId(t.id);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white border-indigo-500 text-indigo-900 shadow-md shadow-indigo-500/10 scale-102 ring-2 ring-indigo-100'
                    : 'bg-white border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                  isActive
                    ? `bg-gradient-to-br ${t.color} text-white shadow-sm`
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.num}
                </span>
                <span className="font-bold text-xs sm:text-sm">{t.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Task Trainer */}
        <div className="min-h-[480px]">
          {activeTaskId === 'sprint_all' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                    <span>⚡ Сквозной спринт: Вставь букву в слово</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-mono font-black">120+ слов</span>
                  </h3>
                  <p className="text-xs text-amber-800">
                    Тренировка в одно касание: корни (№9), приставки (№10), суффиксы (№11), окончания (№12) и Н/НН (№15)
                  </p>
                </div>
              </div>
              <SingleWordTrainer
                words={[
                  ...ORTHOGRAPHY_WORDS.task9,
                  ...ORTHOGRAPHY_WORDS.task10,
                  ...ORTHOGRAPHY_WORDS.task11,
                  ...ORTHOGRAPHY_WORDS.task12,
                  ...ORTHOGRAPHY_WORDS.task15
                ]}
                taskTitle="Сквозной спринт по всем словам"
                taskId="sprint_all"
                onResult={(res, payload) => handleResult(res, payload)}
                onOpenTheory={() => setTheoryOpen(true)}
              />
            </div>
          )}

          {activeTaskId === 'task4' && (
            <StressTrainer
              data={FIPI_GRAMMAR_BANK.task4}
              onResult={(res, payload) => handleResult(res, payload)}
              onOpenTheory={() => setTheoryOpen(true)}
            />
          )}

          {activeTaskId === 'task5' && (
            <ParonymsTrainer
              data={FIPI_GRAMMAR_BANK.task5}
              onResult={(res, payload) => handleResult(res, payload)}
              onOpenTheory={() => setTheoryOpen(true)}
            />
          )}

          {activeTaskId === 'task6' && (
            <LexicsTrainer
              data={FIPI_GRAMMAR_BANK.task6}
              onResult={(res, payload) => handleResult(res, payload)}
              onOpenTheory={() => setTheoryOpen(true)}
            />
          )}

          {activeTaskId === 'task7' && (
            <MorphologyTrainer
              data={FIPI_GRAMMAR_BANK.task7}
              onResult={(res, payload) => handleResult(res, payload)}
              onOpenTheory={() => setTheoryOpen(true)}
            />
          )}

          {activeTaskId === 'task8' && (
            <SyntaxTrainer
              data={FIPI_GRAMMAR_BANK.task8}
              onResult={(res) => handleResult(res)}
              onOpenTheory={() => setTheoryOpen(true)}
            />
          )}

          {['task9', 'task10', 'task11', 'task12', 'task13', 'task14', 'task15'].includes(activeTaskId) && (
            <OrthographyTrainer
              key={activeTaskId}
              taskData={FIPI_GRAMMAR_BANK[activeTaskId]}
              onResult={(res, payload) => handleResult(res, payload)}
              onOpenTheory={() => setTheoryOpen(true)}
            />
          )}

          {['task16', 'task17', 'task18', 'task19', 'task20', 'task21'].includes(activeTaskId) && (
            <PunctuationTrainer
              key={activeTaskId}
              taskData={FIPI_GRAMMAR_BANK[activeTaskId]}
              onResult={(res, payload) => handleResult(res, payload)}
              onOpenTheory={() => setTheoryOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 py-6 text-center text-xs text-slate-500 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            ЕГЭ Русский язык • Официальный открытый банк заданий ФИПИ + конспекты Школково
          </span>
          <span className="text-slate-600 font-semibold">
            Задания №4–21 тестовой части
          </span>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <TheoryDrawer
        isOpen={theoryOpen}
        onClose={() => setTheoryOpen(false)}
        taskData={currentTaskData}
        allTasksData={FIPI_GRAMMAR_BANK}
        onSelectTask={(taskId) => {
          sounds.playClick();
          setActiveTaskId(taskId);
        }}
      />

      <MockExamModal
        isOpen={mockExamOpen}
        onClose={() => setMockExamOpen(false)}
        onFinishExam={handleFinishExam}
      />

      <DictionarySearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <MistakesNotebook
        isOpen={mistakesOpen}
        onClose={() => {
          setMistakesOpen(false);
          setMistakesList(loadMistakes());
        }}
      />
    </div>
  );
}
