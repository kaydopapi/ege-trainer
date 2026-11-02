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

import { GraduationCap, BookMarked, Search, Layers, FileText } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', title: 'Все задания' },
  { id: 'norms', title: 'Нормы языка · №4–8' },
  { id: 'orthography', title: 'Орфография · №9–15' },
  { id: 'punctuation', title: 'Пунктуация · №16–21' }
];

const THEORY_TASK_BY_GROUP = {
  norms: 'task4',
  orthography: 'task9',
  punctuation: 'task16'
};

const TASK_LIST = [
  { id: 'sprint_all', category: 'all', num: 'БЛИЦ', title: 'Спринт по словам', color: '' },
  { id: 'task4', category: 'norms', num: '№4', title: 'Ударения', color: '' },
  { id: 'task5', category: 'norms', num: '№5', title: 'Паронимы', color: '' },
  { id: 'task6', category: 'norms', num: '№6', title: 'Лексика', color: '' },
  { id: 'task7', category: 'norms', num: '№7', title: 'Морфология', color: '' },
  { id: 'task8', category: 'norms', num: '№8', title: 'Синтаксис', color: '' },
  { id: 'task9', category: 'orthography', num: '№9', title: 'Корни', color: '' },
  { id: 'task10', category: 'orthography', num: '№10', title: 'Приставки', color: '' },
  { id: 'task11', category: 'orthography', num: '№11', title: 'Суффиксы', color: '' },
  { id: 'task12', category: 'orthography', num: '№12', title: 'Окончания', color: '' },
  { id: 'task13', category: 'orthography', num: '№13', title: 'НЕ / НИ', color: '' },
  { id: 'task14', category: 'orthography', num: '№14', title: 'Слитно / Дефис', color: '' },
  { id: 'task15', category: 'orthography', num: '№15', title: 'Н и НН', color: '' },
  { id: 'task16', category: 'punctuation', num: '№16', title: 'ССП', color: '' },
  { id: 'task17', category: 'punctuation', num: '№17', title: 'Обороты', color: '' },
  { id: 'task18', category: 'punctuation', num: '№18', title: 'Вводные слова', color: '' },
  { id: 'task19', category: 'punctuation', num: '№19', title: 'СПП', color: '' },
  { id: 'task20', category: 'punctuation', num: '№20', title: 'Стык союзов', color: '' },
  { id: 'task21', category: 'punctuation', num: '№21', title: 'Анализ знаков', color: '' }
];

// Keep this array stable across App re-renders. If it is created inline in
// JSX, every answer updates stats, retriggers SingleWordTrainer's reset effect,
// and the sprint jumps back to word 1.
const SPRINT_WORDS = [
  ...ORTHOGRAPHY_WORDS.task9,
  ...ORTHOGRAPHY_WORDS.task10,
  ...ORTHOGRAPHY_WORDS.task11,
  ...ORTHOGRAPHY_WORDS.task12,
  ...ORTHOGRAPHY_WORDS.task15
];

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash.replace('#', '') || 'dashboard');
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

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash.replace('#', '') || 'dashboard');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (nextRoute) => {
    window.location.hash = nextRoute;
    setRoute(nextRoute);
  };

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
    <div className="app-shell min-h-screen text-slate-900 flex flex-col justify-between selection:bg-[#a6504d] selection:text-white">

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
            <nav className="hidden lg:flex items-center gap-1 mr-2">
              {[
                ['dashboard', 'Кабинет'],
                ['practice', 'Практика'],
                ['theory', 'Теория'],
                ['mistakes', 'Ошибки']
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={`header-nav-link ${route === id ? 'header-nav-link-active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => { setActiveCategory('all'); setActiveTaskId('sprint_all'); }}
              className="header-action header-action-primary hidden sm:flex"
            >
              <span>Блиц</span>
            </button>
            <button
              onClick={() => setMockExamOpen(true)}
              className="header-action hidden md:flex"
            >
              <span>Пробный вариант</span>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="header-action"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Поиск</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-white text-slate-500 font-mono border border-slate-200">⌘K</kbd>
            </button>

            <button
              onClick={() => navigate('theory')}
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 w-full space-y-4 flex-1">
        {route === 'dashboard' && <StatsBar
          stats={stats}
          mistakesCount={mistakesList.length}
          onReset={handleResetStats}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onStartMegaSprint={() => {}}
          onOpenMockExam={() => {}}
          onOpenSearch={() => {}}
          onOpenMistakes={() => {}}
          onOpenTheory={() => {}}
        />}

        {route === 'dashboard' ? (
        <>
        <div className="study-layout">
          <aside className="study-sidebar">
            <div className="study-sidebar-label">Разделы</div>
            <div className="study-sections">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`study-section ${activeCategory === cat.id ? 'study-section-active' : ''}`}
                >
                  <span>{cat.title.split(' · ')[0]}</span>
                  <small>{cat.id === 'all' ? '№4–21' : cat.title.split(' · ')[1]}</small>
                </button>
              ))}
            </div>
            <div className="study-sidebar-label study-sidebar-label-spaced">Задания</div>
            <nav className="study-task-list">
              {filteredTasks.map((t) => {
                const isActive = activeTaskId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { sounds.playClick(); setActiveTaskId(t.id); }}
                    className={`study-task ${isActive ? 'study-task-active' : ''}`}
                  >
                    <span>{t.num}</span>
                    <strong>{t.title}</strong>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="study-stage">
            <div className="stage-heading">
              <div>
                <p className="section-kicker">Тренировка</p>
                <h2>{TASK_LIST.find((task) => task.id === activeTaskId)?.title || 'Выберите задание'}</h2>
              </div>
              <button className="stage-theory-link" onClick={() => setTheoryOpen(true)}>Открыть теорию →</button>
            </div>

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
                words={SPRINT_WORDS}
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
          </section>
        </div>
        </>
        ) : route === 'practice' ? (
          <section className="page-section">
            <div className="page-heading">
              <p className="section-kicker">Каталог</p>
              <h2>Практика по заданиям</h2>
              <p>Выберите тему и переходите сразу к тренировке. Полная база заданий подключается через backend.</p>
            </div>
            <div className="catalog-grid">
              {CATEGORIES.slice(1).map((category) => (
                <div className="catalog-section" key={category.id}>
                  <div className="catalog-section-header">
                    <h3>{category.title}</h3>
                    <span>{TASK_LIST.filter((task) => task.category === category.id).length} тем</span>
                  </div>
                  <div className="catalog-list">
                    {TASK_LIST.filter((task) => task.category === category.id).map((task) => (
                      <button
                        key={task.id}
                        className="catalog-item"
                        onClick={() => { setActiveTaskId(task.id); setActiveCategory(category.id); navigate('dashboard'); }}
                      >
                        <span>{task.num}</span>
                        <strong>{task.title}</strong>
                        <small>Открыть →</small>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : route === 'theory' ? (
          <section className="page-section">
            <div className="page-heading">
              <p className="section-kicker">Справочник</p>
              <h2>Теория ЕГЭ</h2>
              <p>Правила, алгоритмы и исключения по заданиям №4–21. Выберите тему в базе правил.</p>
            </div>
            <div className="theory-page-grid">
              {CATEGORIES.slice(1).map((category) => (
                <button
                  key={category.id}
                  className="theory-page-link"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveTaskId(THEORY_TASK_BY_GROUP[category.id]);
                    setTheoryOpen(true);
                  }}
                >
                  <span>{category.title}</span>
                  <strong>Открыть базу правил →</strong>
                </button>
              ))}
            </div>
          </section>
        ) : route === 'mistakes' ? (
          <section className="page-section">
            <div className="page-heading">
              <p className="section-kicker">Повторение</p>
              <h2>Работа над ошибками</h2>
              <p>Все задания, в которых вы ошиблись, собраны в одном месте.</p>
            </div>
            <div className="empty-page-card">
              <strong>{mistakesList.length ? `${mistakesList.length} ошибок ждут повторения` : 'Пока ошибок нет'}</strong>
              <p>{mistakesList.length ? 'Откройте тетрадь, чтобы разобрать каждое задание.' : 'Ошибки появятся здесь после первой неверной попытки.'}</p>
              <button className="primary-cta" onClick={() => setMistakesOpen(true)}>Открыть тетрадь</button>
            </div>
          </section>
        ) : (
          <section className="page-section">
            <div className="page-heading">
              <p className="section-kicker">Экзамен</p>
              <h2>Пробный вариант</h2>
              <p>Соберите полноценную попытку по заданиям тестовой части.</p>
            </div>
            <div className="empty-page-card">
              <strong>12 заданий · 30 минут</strong>
              <p>Результат и разбор ошибок появятся после завершения попытки.</p>
              <button className="primary-cta" onClick={() => setMockExamOpen(true)}>Начать пробный вариант</button>
            </div>
          </section>
        )}
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
