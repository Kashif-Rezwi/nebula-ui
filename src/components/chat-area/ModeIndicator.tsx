import { IoFlashOutline, IoBulbOutline } from 'react-icons/io5';
import type { EffectiveMode } from '../../types';

interface ModeIndicatorProps {
    mode: EffectiveMode;
    wasAutoSelected?: boolean;
}

const MODE_DISPLAY: Record<EffectiveMode, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    fast: {
        icon: IoFlashOutline,
        color: 'text-blue-400',
        label: 'Fast',
    },
    thinking: {
        icon: IoBulbOutline,
        color: 'text-purple-400',
        label: 'Thinking',
    },
};

export function ModeIndicator({ mode, wasAutoSelected = false }: ModeIndicatorProps) {
    const config = MODE_DISPLAY[mode];
    if (!config) return null;

    const Icon = config.icon;
    const tooltipText = wasAutoSelected
        ? `Mode: ${config.label} (Auto-selected based on query complexity)`
        : `Mode: ${config.label}`;

    return (
        <div
            className="flex items-center gap-1 text-xs text-foreground/60"
            title={tooltipText}
        >
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            <span>{config.label}</span>
            {wasAutoSelected && (
                <span className="text-foreground/40">(Auto)</span>
            )}
        </div>
    );
}
