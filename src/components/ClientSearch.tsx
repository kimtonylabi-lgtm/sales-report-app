'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClientSearch({ onSelect }: { onSelect: (client: { id: string, name: string }) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);

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
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="고객사명 검색..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
            </div>

            {isFocused && (query.length > 0 || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    {results.map((client) => (
                        <button
                            key={client.id}
                            onClick={() => handleSelect(client)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0"
                        >
                            {client.name}
                        </button>
                    ))}
                    {query.length > 0 && !results.find(r => r.name === query) && (
                        <button
                            onClick={handleCreate}
                            className="w-full text-left px-4 py-3 text-primary font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center"
                        >
                            <Plus size={18} className="mr-2" />
                            "{query}" 신규 등록
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
