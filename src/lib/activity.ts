import { MapPin, Phone, Mail, Users, Video, Clock, type LucideIcon } from 'lucide-react';

/** Activity types — single source for labels, icons and colors (was copied into five files). */
export const ACTIVITY_TYPES = [
    { id: 'visit', label: '방문', icon: MapPin, solid: 'bg-blue-500 text-white shadow-blue-200', soft: 'bg-blue-50 text-blue-500', dot: 'bg-blue-500 shadow-blue-200' },
    { id: 'phone', label: '전화', icon: Phone, solid: 'bg-green-500 text-white shadow-green-200', soft: 'bg-green-50 text-green-500', dot: 'bg-green-500 shadow-green-200' },
    { id: 'email', label: '메일', icon: Mail, solid: 'bg-purple-500 text-white shadow-purple-200', soft: 'bg-purple-50 text-purple-500', dot: 'bg-purple-500 shadow-purple-200' },
    { id: 'offline_meeting', label: '오프라인 미팅', icon: Users, solid: 'bg-orange-500 text-white shadow-orange-200', soft: 'bg-orange-50 text-orange-500', dot: 'bg-orange-500 shadow-orange-200' },
    { id: 'video_meeting', label: '화상미팅', icon: Video, solid: 'bg-teal-500 text-white shadow-teal-200', soft: 'bg-teal-50 text-teal-500', dot: 'bg-teal-500 shadow-teal-200' },
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number]['id'];

const FALLBACK = { id: 'other', label: '기타', icon: Clock as LucideIcon, solid: 'bg-gray-500 text-white', soft: 'bg-gray-50 text-gray-500', dot: 'bg-gray-500 shadow-gray-200' };

export function activityOf(type: string) {
    return ACTIVITY_TYPES.find((t) => t.id === type) ?? FALLBACK;
}
