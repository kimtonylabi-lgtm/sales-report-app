'use client';

import { useCallback, useEffect, useState } from 'react';
import { startOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase';

export type TodayReport = {
    id: string;
    type: string;
    content: string;
    created_at: string;
    clients: { name: string } | null;
};

/** Reports I submitted today (local day), oldest first — the daily report as it builds up. */
async function fetchTodayReports(userId: string): Promise<TodayReport[]> {
    const { data } = await supabase
        .from('reports')
        .select('id, type, content, created_at, clients(name)')
        .eq('user_id', userId)
        .gte('created_at', startOfDay(new Date()).toISOString())
        .order('created_at', { ascending: true });
    return (data ?? []) as unknown as TodayReport[];
}

export function useTodayReports(userId: string | undefined) {
    const [today, setToday] = useState<TodayReport[]>([]);

    useEffect(() => {
        if (!userId) return;
        let active = true;
        fetchTodayReports(userId).then((list) => {
            if (active) setToday(list);
        });
        return () => {
            active = false;
        };
    }, [userId]);

    const reload = useCallback(() => {
        if (userId) fetchTodayReports(userId).then(setToday);
    }, [userId]);

    return { today, reload };
}
