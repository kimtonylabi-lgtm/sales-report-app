'use client';

import { useEffect, useRef } from 'react';

export type ReportDraft = {
    client: { id: string; name: string } | null;
    type: string | null;
    content: string;
};

const keyFor = (userId: string) => `ct-report-draft:${userId}`;

/**
 * Keeps the report being written in this phone's storage, so a weak signal, a failed submit or the
 * browser reloading the tab after the screen turns off does not lose it. Per user (shared phones),
 * cleared after a successful submit. Storage can be unavailable (private mode) — then it simply
 * does nothing.
 */
export function useReportDraft(userId: string | undefined, draft: ReportDraft, onRestore: (d: ReportDraft) => void) {
    const restored = useRef(false);

    // Restore once per user
    useEffect(() => {
        if (!userId || restored.current) return;
        restored.current = true;
        try {
            const raw = localStorage.getItem(keyFor(userId));
            if (!raw) return;
            const d = JSON.parse(raw) as ReportDraft;
            if (d && (d.client || d.type || d.content)) onRestore(d);
        } catch {
            /* storage unavailable or corrupt — ignore */
        }
        // onRestore is intentionally not a dependency: restore happens exactly once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Save on every change (after the restore attempt)
    const { client, type, content } = draft;
    useEffect(() => {
        if (!userId || !restored.current) return;
        try {
            if (client || type || content) localStorage.setItem(keyFor(userId), JSON.stringify({ client, type, content }));
            else localStorage.removeItem(keyFor(userId));
        } catch {
            /* ignore */
        }
    }, [userId, client, type, content]);

    return {
        clear: () => {
            if (!userId) return;
            try {
                localStorage.removeItem(keyFor(userId));
            } catch {
                /* ignore */
            }
        },
    };
}
