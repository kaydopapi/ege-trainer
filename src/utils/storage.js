// Управление сохранением прогресса в LocalStorage

const STATS_KEY = 'ege_trainer_stats_v2';
const MISTAKES_KEY = 'ege_trainer_mistakes_v2';

export function loadUserStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    xp: 0,
    totalSolved: 0,
    correctCount: 0,
    wrongCount: 0,
    streak: 0,
    bestStreak: 0,
    taskStats: {} // task4: { solved: 10, correct: 9 }
  };
}

export function saveUserStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error(e);
  }
}

export function loadMistakes() {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function addMistake(mistakeItem) {
  try {
    const list = loadMistakes();
    // Don't duplicate exact question
    const exists = list.some((m) => m.id === mistakeItem.id && m.taskId === mistakeItem.taskId);
    if (!exists) {
      list.unshift({ ...mistakeItem, timestamp: Date.now() });
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(list.slice(0, 100))); // keep up to 100
    }
  } catch (e) {
    console.error(e);
  }
}

export function removeMistake(id, taskId) {
  try {
    const list = loadMistakes().filter((m) => !(m.id === id && m.taskId === taskId));
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function calculateLevel(xp) {
  // Simple RPG level curve
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const currentLevelBaseXP = (level - 1) * (level - 1) * 50;
  const nextLevelXP = level * level * 50;
  const progressInLevel = xp - currentLevelBaseXP;
  const levelSpan = nextLevelXP - currentLevelBaseXP;
  const percent = Math.min(100, Math.round((progressInLevel / levelSpan) * 100));

  let title = "Новичок";
  if (level >= 15) title = "Стобалльник ЕГЭ 🏆";
  else if (level >= 10) title = "Магистр языка 🎓";
  else if (level >= 7) title = "Эксперт орфографии ⚡";
  else if (level >= 4) title = "Грамотей 📖";
  else if (level >= 2) title = "Стажёр ✏️";

  return { level, percent, title, nextLevelXP, currentLevelBaseXP };
}
