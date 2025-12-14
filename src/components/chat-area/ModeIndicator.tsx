import { IoFlashOutline, IoBulbOutline, IoSparklesOutline } from 'react-icons/io5';
import type { OperationalMode } from '../../types';

interface ModeIndicatorProps {
    mode: OperationalMode;
    showDetails?: boolean;
    modelUsed?: string;
    tokensUsed?: number;
    temperature?: number;
}

const MODE_DISPLAY: Record<OperationalMode, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
    fast: {
        icon: IoFlashOutline,
        label: 'Fast',
        color: 'text-blue-400',
    },
    thinking: {
        icon: IoBulbOutline,
        label: 'Thinking',
        color: 'text-purple-400',
    },
    auto: {
        icon: IoSparklesOutline,
        label: 'Auto',
        color: 'text-teal-400',
    },
};

export function ModeIndicator({ mode, showDetails = false, modelUsed, tokensUsed, temperature }: ModeIndicatorProps) {
    const config = MODE_DISPLAY[mode];
    if (!config) return null;

    const Icon = config.icon;

    if (showDetails) {
        return (
            <div className="flex flex-col gap-1 text-xs text-foreground/60">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                    <Icon className={`w-3 h-3 ${config.color}`} />
                    <span>{config.label}</span>
                </div>
                {modelUsed && <div>Model: {modelUsed}</div>}
                {tokensUsed && <div>Tokens: {tokensUsed}</div>}
                {temperature !== undefined && <div>Temp: {temperature}</div>}
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
            <Icon className={`w-3 h-3 ${config.color}`} />
            <span className="text-xs text-foreground/60">{config.label}</span>
        </div>
    );
}
