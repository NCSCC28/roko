import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, FileText, Search, Sparkles, Trash2 } from 'lucide-react';

type Tradition = 'gita' | 'bible' | 'quran' | 'general';
type Mood = 'grateful' | 'challenged' | 'curious' | 'peaceful' | 'motivated';

interface ReflectionEntry {
  id: string;
  tradition: Tradition;
  reference: string;
  title: string;
  note: string;
  reflection: string;
  tags: string[];
  mood: Mood;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'roko_user_reflections_v1';

const traditionMeta: Record<Tradition, { label: string; badgeClass: string }> = {
  gita: {
    label: 'Bhagavad Gita',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  bible: {
    label: 'Bible',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  quran: {
    label: 'Quran',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  general: {
    label: 'General Reflection',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  },
};

const moodOptions: Array<{ value: Mood; label: string }> = [
  { value: 'grateful', label: 'Grateful' },
  { value: 'curious', label: 'Curious' },
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'motivated', label: 'Motivated' },
  { value: 'challenged', label: 'Challenged' },
];

const reflectionPrompts: Record<Tradition, string[]> = {
  gita: [
    'Which part of this verse challenges your ego the most?',
    'What action today reflects Karma Yoga for you?',
    'Where can you practice detachment without avoiding responsibility?',
  ],
  bible: [
    'What does this verse change in how you treat people today?',
    'Where do you need to practice forgiveness this week?',
    'How can you turn this teaching into one act of service?',
  ],
  quran: [
    'What does this ayah ask you to do with more sincerity?',
    'How can patience and trust show up in your routine?',
    'What one habit can align better with justice and mercy?',
  ],
  general: [
    'What truth did you understand today that you were ignoring before?',
    'What one behavior will you change before tomorrow?',
    'What is one prayer or intention you want to keep this week?',
  ],
};

function loadEntries(): ReflectionEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is ReflectionEntry => {
        if (!item || typeof item !== 'object') return false;
        const candidate = item as Partial<ReflectionEntry>;
        return (
          typeof candidate.id === 'string' &&
          typeof candidate.tradition === 'string' &&
          typeof candidate.note === 'string' &&
          typeof candidate.reflection === 'string' &&
          typeof candidate.createdAt === 'string' &&
          typeof candidate.updatedAt === 'string'
        );
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length > 0)
    )
  ).slice(0, 10);
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
}

export default function NotesPage() {
  const [entries, setEntries] = useState<ReflectionEntry[]>(loadEntries);
  const [tradition, setTradition] = useState<Tradition>('gita');
  const [reference, setReference] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [reflection, setReflection] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [mood, setMood] = useState<Mood>('curious');
  const [query, setQuery] = useState('');
  const [filterTradition, setFilterTradition] = useState<Tradition | 'all'>('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const selectedPrompts = reflectionPrompts[tradition];

  const totalNotes = entries.length;
  const thisWeekCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return entries.filter((entry) => new Date(entry.createdAt).getTime() >= sevenDaysAgo).length;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      if (filterTradition !== 'all' && entry.tradition !== filterTradition) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        entry.title,
        entry.reference,
        entry.note,
        entry.reflection,
        entry.tags.join(' '),
        entry.mood,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [entries, filterTradition, query]);

  const handleSaveEntry = () => {
    if (!note.trim() && !reflection.trim()) {
      return;
    }

    const now = new Date().toISOString();
    const nextEntry: ReflectionEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      tradition,
      reference: reference.trim(),
      title: title.trim() || `${traditionMeta[tradition].label} Reflection`,
      note: note.trim(),
      reflection: reflection.trim(),
      tags: parseTags(tagsInput),
      mood,
      createdAt: now,
      updatedAt: now,
    };

    setEntries((prev) => [nextEntry, ...prev]);
    setReference('');
    setTitle('');
    setNote('');
    setReflection('');
    setTagsInput('');
    setMood('curious');
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const applyPrompt = (prompt: string) => {
    setReflection((prev) => {
      if (!prev.trim()) return prompt;
      return `${prev.trim()}\n\n${prompt}`;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              Personal Study Journal
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-white">Notes + Personal Reflection</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-3xl">
            Save what you learned, write your personal reflection, and track your spiritual growth over time.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="rounded-2xl bg-white/85 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm text-slate-500 dark:text-slate-300">Total Entries</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalNotes}</p>
          </div>
          <div className="rounded-2xl bg-white/85 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm text-slate-500 dark:text-slate-300">This Week</p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{thisWeekCount}</p>
          </div>
          <div className="rounded-2xl bg-white/85 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm text-slate-500 dark:text-slate-300">Active Prompt Set</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{traditionMeta[tradition].label}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Create Entry</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Scripture</label>
                <select
                  value={tradition}
                  onChange={(e) => setTradition(e.target.value as Tradition)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {Object.entries(traditionMeta).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Reference</label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Example: Gita 2:47, John 3:16, Quran 2:153"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this entry a name"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Mood</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as Mood)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {moodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Study Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Write key insights from this verse or chapter"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Personal Reflection</label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={5}
                  placeholder="How will this teaching change your actions?"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Tags (comma separated)</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="discipline, peace, forgiveness"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleSaveEntry}
                disabled={!note.trim() && !reflection.trim()}
                className="w-full rounded-lg px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-400"
              >
                Save Note & Reflection
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Reflection Prompts</p>
              <div className="space-y-2">
                {selectedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => applyPrompt(prompt)}
                    className="w-full text-left text-sm rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, reflection, tags, or reference"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-9 pr-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={filterTradition}
                onChange={(e) => setFilterTradition(e.target.value as Tradition | 'all')}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Traditions</option>
                {Object.entries(traditionMeta).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 py-14 text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">No entries found</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Save your first reflection to build your personal wisdom journal.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
                {filteredEntries.map((entry) => (
                  <article key={entry.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{entry.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${traditionMeta[entry.tradition].badgeClass}`}>
                            {traditionMeta[entry.tradition].label}
                          </span>
                          {entry.reference && (
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              {entry.reference}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDateLabel(entry.updatedAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-100 dark:bg-rose-900/30 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>

                    {entry.note && (
                      <div className="mb-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Study Note</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{entry.note}</p>
                      </div>
                    )}

                    {entry.reflection && (
                      <div className="mb-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Personal Reflection</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{entry.reflection}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 px-2.5 py-1 font-semibold">
                        Mood: {entry.mood}
                      </span>
                      {entry.tags.map((tag) => (
                        <span
                          key={`${entry.id}-${tag}`}
                          className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
