import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ACTIVITY_TYPES, activityOf } from '@/lib/activity';

/** clients.kind (supabase_client_kinds_2026-11.sql): customer / internal (사내) / vendor (외주업체). */
export type ClientKind = 'customer' | 'internal' | 'vendor';

export type ExportRow = {
    activity_at: string;
    type: string;
    content: string;
    client: string;
    kind: ClientKind;
    author: string;
};

const HEADER_FILL = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE8EEF8' } };
const THIN = { style: 'thin' as const, color: { argb: 'FFD0D7E2' } };
const BORDER = { top: THIN, left: THIN, bottom: THIN, right: THIN };

/**
 * Build the leader's report workbook (.xlsx):
 *  ① 요약 — per person, customer activities by type + in-house and vendor counts
 *  ② 고객 활동 / ③ 사내 업무 / ④ 외주 업무 — grouped by person, oldest first within each person
 * The time of day is left out on purpose: most reports are written in a batch before leaving
 * (58% between 17–18h), so the clock time is when it was typed, not when the visit happened.
 * exceljs is loaded only when this runs, so it never weighs on normal page loads.
 */
export async function buildReportWorkbook(rows: ExportRow[], periodLabel: string): Promise<Blob> {
    const { default: ExcelJS } = await import('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.created = new Date();

    const sorted = [...rows].sort(
        (a, b) => a.author.localeCompare(b.author, 'ko') || a.activity_at.localeCompare(b.activity_at)
    );
    const customer = sorted.filter((r) => r.kind === 'customer');
    const internal = sorted.filter((r) => r.kind === 'internal');
    const vendor = sorted.filter((r) => r.kind === 'vendor');
    const days = rows.map((r) => r.activity_at).sort();
    const range = days.length
        ? `${format(new Date(days[0]), 'yyyy.MM.dd')} ~ ${format(new Date(days[days.length - 1]), 'yyyy.MM.dd')}`
        : '';

    // ① 요약
    const sum = wb.addWorksheet('요약', { views: [{ state: 'frozen', ySplit: 3 }] });
    sum.addRow([`영업보고 요약 — ${periodLabel} (${range})`]).font = { bold: true, size: 13 };
    sum.addRow(['고객 활동은 사내(공장·본사·샘플실·지원사업·전시회)와 외주업체 업무를 뺀 건수입니다. 두 가지는 오른쪽에 따로 셉니다.']).font = { size: 9, color: { argb: 'FF6B7280' } };
    const typeLabels = ACTIVITY_TYPES.map((t) => t.label);
    const head = sum.addRow(['작성자', ...typeLabels, '고객 활동 합계', '고객사 수', '사내 업무', '외주 업무']);
    const people = [...new Set(sorted.map((r) => r.author))];
    const stats = people
        .map((p) => {
            const mine = customer.filter((r) => r.author === p);
            return {
                p,
                byType: ACTIVITY_TYPES.map((t) => mine.filter((r) => r.type === t.id).length),
                total: mine.length,
                clients: new Set(mine.map((r) => r.client)).size,
                internal: internal.filter((r) => r.author === p).length,
                vendor: vendor.filter((r) => r.author === p).length,
            };
        })
        .sort((a, b) => b.total - a.total);
    for (const s of stats) sum.addRow([s.p, ...s.byType, s.total, s.clients, s.internal, s.vendor]);
    const totalRow = sum.addRow([
        '합계',
        ...ACTIVITY_TYPES.map((_, i) => stats.reduce((n, s) => n + s.byType[i], 0)),
        customer.length,
        new Set(customer.map((r) => r.client)).size,
        internal.length,
        vendor.length,
    ]);
    totalRow.font = { bold: true };
    sum.columns.forEach((c, i) => (c.width = i === 0 ? 12 : 13));
    for (let r = head.number; r <= totalRow.number; r++) {
        sum.getRow(r).eachCell({ includeEmpty: true }, (cell, col) => {
            cell.border = BORDER;
            cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
        });
    }
    head.font = { bold: true };
    head.eachCell((cell) => (cell.fill = HEADER_FILL));
    totalRow.eachCell((cell) => (cell.fill = HEADER_FILL));

    // ② 고객 활동 / ③ 사내 업무
    const detail = (name: string, list: ExportRow[]) => {
        const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
        ws.columns = [
            { header: '날짜', key: 'date', width: 15 },
            { header: '작성자', key: 'author', width: 10 },
            { header: '고객사', key: 'client', width: 24 },
            { header: '활동종류', key: 'type', width: 13 },
            { header: '보고내용', key: 'content', width: 70 },
        ];
        for (const r of list) {
            ws.addRow({
                date: format(new Date(r.activity_at), 'yyyy-MM-dd (E)', { locale: ko }),
                author: r.author,
                client: r.client,
                type: activityOf(r.type).label,
                content: r.content,
            });
        }
        ws.getRow(1).font = { bold: true };
        ws.getRow(1).eachCell((cell) => {
            cell.fill = HEADER_FILL;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        ws.eachRow((row, i) => {
            row.eachCell({ includeEmpty: true }, (cell, col) => {
                cell.border = BORDER;
                if (i > 1) cell.alignment = { vertical: 'top', wrapText: col === 5, horizontal: col === 5 || col === 3 ? 'left' : 'center' };
            });
        });
        ws.autoFilter = { from: 'A1', to: 'E1' };
    };
    detail('고객 활동', customer);
    detail('사내 업무', internal);
    detail('외주 업무', vendor);

    const buf = await wb.xlsx.writeBuffer();
    return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
