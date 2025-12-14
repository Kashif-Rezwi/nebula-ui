import { IoFlashOutline, IoBulbOutline } from 'react-icons/io5';
import type { EffectiveMode } from '../../types';

interface ModeIndicatorProps {
    mode: EffectiveMode;
}

const MODE_DISPLAY: Record<EffectiveMode, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    fast: {
        icon: IoFlashOutline,
        color: 'text-blue-400',
    },
    thinking: {
        icon: IoBulbOutline,
        color: 'text-purple-400',
    },
};

export function ModeIndicator({ mode }: ModeIndicatorProps) {
    const config = MODE_DISPLAY[mode];
    if (!config) return null;

    const Icon = config.icon;

    return (
        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
    );
}
