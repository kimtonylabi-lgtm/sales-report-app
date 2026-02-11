'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClientSearch({ onSelect }: { onSelect: (client: { id: string, name: string }) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
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
        if (query.length < 1) {
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
    }, [query]);

    const handleSelect = (client: { id: string, name: string }) => {
        onSelect(client);
        setQuery(client.name);
        setResults([]);
        setIsFocused(false);
    };

    const handleCreate = async () => {
        if (!query) return;
        setIsCreating(true);
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([{ name: query }])
                .select()
                .single();

            if (data) {
                handleSelect(data);
            } else if (error && error.code === '23505') { // Unique violation
                // If it exists, find it
                const { data: existing } = await supabase
                    .from('clients')
                    .select('id, name')
                    .eq('name', query)
                    .single();
                if (existing) handleSelect(existing);
            }
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full z-20">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="고객사명 검색 또는 입력..."
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary/20 shadow-sm focus:shadow-lg focus:outline-none transition-all font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                />
            </div>

            {isFocused && (query.length > 0) && (
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
                            '{query}' 검색 결과가 없습니다.
                        </div>
                    )}

                    {!results.find(r => r.name === query) && (
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
                            "{query}" 신규 등록하기
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
