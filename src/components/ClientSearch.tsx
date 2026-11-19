'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Loader2, X } from 'lucide-react';

/** Display name: drop legal-form words ((주), ㈜, 주식회사, (유)) and extra spaces. */
const cleanName = (s: string) => s.replace(/\(주\)|㈜|주식회사|\(유\)/g, '').replace(/\s+/g, ' ').trim();
/** Must match the DB generated column clients.name_key (supabase_clients_cleanup_2026-11.sql). */
const nameKey = (s: string) => s.replace(/\(주\)|㈜|주식회사|\(유\)/g, '').replace(/[\s\-_.·,]/g, '').toLowerCase();

type ClientRef = { id: string; name: string };

export function ClientSearch({
    onSelect,
    onClear,
    defaultClient,
}: {
    onSelect: (client: ClientRef) => void;
    /** Called when the selection is removed (X button, or the text is edited after selecting). */
    onClear?: () => void;
    /** Pre-selected client shown on mount (remount with a new `key` to change it). */
    defaultClient?: ClientRef | null;
}) {
    const [query, setQuery] = useState(defaultClient?.name ?? '');
    const [results, setResults] = useState<ClientRef[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedName, setSelectedName] = useState<string | null>(defaultClient?.name ?? null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 1 || query === selectedName) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            const { data } = await supabase
                .from('clients')
                .select('id, name')
                .ilike('name', `%${query}%`)
                .limit(5);

            setResults(data || []);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, selectedName]);

    const handleSelect = (client: ClientRef) => {
        onSelect(client);
        setQuery(client.name);
        setSelectedName(client.name);
        setResults([]);
        setIsFocused(false);
    };

    const handleClear = () => {
        setQuery('');
        setSelectedName(null);
        setResults([]);
        onClear?.();
    };

    const handleChange = (value: string) => {
        setQuery(value);
        // Editing the text after picking a client means the pick no longer applies.
        if (selectedName !== null && value !== selectedName) {
            setSelectedName(null);
            onClear?.();
        }
    };

    const newName = cleanName(query);
    // At least 2 characters, so a stray keystroke cannot register a client like "군".
    const canCreate =
        selectedName === null &&
        nameKey(newName).length >= 2 &&
        !results.some((r) => nameKey(r.name) === nameKey(newName));

    const handleCreate = async () => {
        if (!canCreate) return;
        setIsCreating(true);
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([{ name: newName }])
                .select('id, name')
                .single();

            if (data) {
                handleSelect(data);
            } else if (error?.code === '23505') {
                // Same company already exists under another spelling, e.g. "(주)코스맥스" vs "코스맥스" — select it.
                const { data: existing } = await supabase
                    .from('clients')
                    .select('id, name')
                    .eq('name_key', nameKey(newName))
                    .single();
                if (existing) {
                    handleSelect(existing);
                    alert(`이미 등록된 "${existing.name}"을(를) 선택했습니다.`);
                }
            } else if (error) {
                alert('고객사 등록 실패: ' + error.message);
            }
        } finally {
            setIsCreating(false);
        }
    };

    const showDropdown = isFocused && query.length > 0 && selectedName === null;

    return (
        <div ref={wrapperRef} className="relative w-full z-20">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="고객사명 검색 또는 입력..."
                    className="w-full pl-11 pr-12 py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary/20 shadow-sm focus:shadow-lg focus:outline-none transition-all font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="고객사 선택 해제"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {results.length > 0 ? (
                        <>
                            <div className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-900/50">검색 결과</div>
                            {results.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => handleSelect(client)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors flex items-center justify-between group"
                                >
                                    <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">{client.name}</span>
                                    <span className="text-xs text-gray-400 group-hover:text-primary/70">선택</span>
                                </button>
                            ))}
                        </>
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-400">
                            &lsquo;{query}&rsquo; 검색 결과가 없습니다.
                        </div>
                    )}

                    {canCreate && (
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="w-full text-left px-4 py-4 bg-primary/5 hover:bg-primary/10 text-primary font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            {isCreating ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <Plus size={18} className="mr-2" />
                            )}
                            &ldquo;{newName}&rdquo; 신규 등록하기
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
