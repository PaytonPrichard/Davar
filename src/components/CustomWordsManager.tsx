"use client";

import { useState, useMemo } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import AudioButton from "./AudioButton";

type SortOption = "recent" | "alpha-hebrew" | "alpha-english" | "category";

export default function CustomWordsManager() {
  const { customWords, addCustomWord, deleteCustomWord, updateCustomWord } =
    useVocabulary();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const [form, setForm] = useState({
    hebrew: "",
    hebrewNikud: "",
    transliteration: "",
    translation: "",
    category: "",
  });

  const resetForm = () => {
    setForm({
      hebrew: "",
      hebrewNikud: "",
      transliteration: "",
      translation: "",
      category: "",
    });
  };

  const handleAdd = () => {
    if (!form.hebrew || !form.transliteration || !form.translation) return;
    addCustomWord({
      hebrew: form.hebrew,
      hebrewNikud: form.hebrewNikud || form.hebrew,
      transliteration: form.transliteration,
      translation: form.translation,
      category: form.category || "Custom",
    });
    resetForm();
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!editingId || !form.hebrew || !form.transliteration || !form.translation) return;
    updateCustomWord(editingId, {
      hebrew: form.hebrew,
      hebrewNikud: form.hebrewNikud || form.hebrew,
      transliteration: form.transliteration,
      translation: form.translation,
      category: form.category || "Custom",
    });
    resetForm();
    setEditingId(null);
  };

  const startEdit = (wordId: string) => {
    const word = customWords.find((w) => w.id === wordId);
    if (!word) return;
    setForm({
      hebrew: word.hebrew,
      hebrewNikud: word.hebrewNikud,
      transliteration: word.transliteration,
      translation: word.translation,
      category: word.category,
    });
    setEditingId(wordId);
    setIsAdding(false);
  };

  const displayWords = useMemo(() => {
    let words = [...customWords];
    // Filter by search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      words = words.filter(
        (w) =>
          w.hebrew.includes(q) ||
          w.hebrewNikud.includes(q) ||
          w.transliteration.toLowerCase().includes(q) ||
          w.translation.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q)
      );
    }
    // Sort
    switch (sortBy) {
      case "alpha-hebrew":
        words.sort((a, b) => a.hebrew.localeCompare(b.hebrew, "he"));
        break;
      case "alpha-english":
        words.sort((a, b) => a.translation.localeCompare(b.translation, "en"));
        break;
      case "category":
        words.sort((a, b) => a.category.localeCompare(b.category) || a.translation.localeCompare(b.translation));
        break;
      // "recent" = default insertion order (newest last already)
    }
    return words;
  }, [customWords, search, sortBy]);

  const formFields = (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">
            Hebrew *
          </label>
          <input
            type="text"
            value={form.hebrew}
            onChange={(e) => setForm((f) => ({ ...f, hebrew: e.target.value }))}
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hebrew-text text-lg"
            placeholder="שלום"
            dir="rtl"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">
            Hebrew with Nikud
          </label>
          <input
            type="text"
            value={form.hebrewNikud}
            onChange={(e) =>
              setForm((f) => ({ ...f, hebrewNikud: e.target.value }))
            }
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary hebrew-text text-lg"
            placeholder="שָׁלוֹם"
            dir="rtl"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">
            Transliteration *
          </label>
          <input
            type="text"
            value={form.transliteration}
            onChange={(e) =>
              setForm((f) => ({ ...f, transliteration: e.target.value }))
            }
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary"
            placeholder="shalom"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">
            Translation *
          </label>
          <input
            type="text"
            value={form.translation}
            onChange={(e) =>
              setForm((f) => ({ ...f, translation: e.target.value }))
            }
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary"
            placeholder="hello / peace"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1">Category</label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary"
          placeholder="Custom"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-text-secondary text-sm">
          {customWords.length} custom word{customWords.length !== 1 ? "s" : ""}
          {search && ` (${displayWords.length} shown)`}
        </p>
        {!isAdding && !editingId && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors"
          >
            + Add Word
          </button>
        )}
      </div>

      {/* Search & Sort */}
      {customWords.length > 0 && (
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words..."
            className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary text-sm focus:border-accent"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent"
          >
            <option value="recent">Recent</option>
            <option value="alpha-hebrew">A-Z Hebrew</option>
            <option value="alpha-english">A-Z English</option>
            <option value="category">Category</option>
          </select>
        </div>
      )}

      {/* Add form */}
      {isAdding && (
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Add Custom Word
          </h3>
          {formFields}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
              className="px-4 py-2 rounded-xl bg-bg-secondary text-text-secondary hover:text-text-primary font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editingId && (
        <div className="bg-bg-card border border-accent/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Edit Word
          </h3>
          {formFields}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                resetForm();
              }}
              className="px-4 py-2 rounded-xl bg-bg-secondary text-text-secondary hover:text-text-primary font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Word list */}
      {customWords.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <div className="text-3xl mb-2">&#128218;</div>
          <p>No custom words yet. Add your first word above!</p>
        </div>
      ) : displayWords.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <p>No words match your search.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayWords.map((word) => (
            <div
              key={word.id}
              className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-bg-card-hover transition-colors"
            >
              <div className="hebrew-text text-2xl font-bold text-text-primary min-w-[80px] text-center">
                {word.hebrewNikud}
              </div>
              <AudioButton text={word.hebrew} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-accent font-medium">
                  {word.transliteration}
                </div>
                <div className="text-sm text-text-secondary truncate">
                  {word.translation}
                </div>
              </div>
              <span className="text-xs text-text-muted bg-bg-secondary px-2 py-1 rounded-lg">
                {word.category}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(word.id)}
                  className="p-1.5 text-text-muted hover:text-accent-blue transition-colors"
                  title="Edit"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteCustomWord(word.id)}
                  className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
