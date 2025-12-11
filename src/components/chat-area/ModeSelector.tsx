import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { IoFlashOutline } from 'react-icons/io5';
import { IoBulbOutline } from 'react-icons/io5';
import { IoSparklesOutline } from 'react-icons/io5';
import type { OperationalMode } from '../../types';

interface ModeSelectorProps {
    currentMode: OperationalMode;
    onModeChange: (mode: OperationalMode) => void;
    disabled?: boolean;
}

interface ModeConfig {
    mode: OperationalMode;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const MODE_CONFIGS: ModeConfig[] = [
    {
        mode: 'fast',
        label: 'Fast',
        description: 'Quick & concise',
        icon: IoFlashOutline,
    },
    {
        mode: 'thinking',
        label: 'Thinking',
        description: 'Detailed & comprehensive',
        icon: IoBulbOutline,
    },
    {
        mode: 'auto',
        label: 'Auto',
        description: 'AI decides',
        icon: IoSparklesOutline,
    },
];

export function ModeSelector({ currentMode, onModeChange, disabled = false }: ModeSelectorProps) {
    const selectedConfig = MODE_CONFIGS.find(config => config.mode === currentMode) || MODE_CONFIGS[2];
    const Icon = selectedConfig.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                asChild
                className="border border-border transition-smooth group outline-none focus:outline-none focus:ring-0"
                disabled={disabled}
            >
                <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] transition-smooth group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon className="w-4 h-4 text-foreground/80" />
                    <div className="flex flex-col items-start min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">
                            {selectedConfig.label}
                        </div>
                    </div>
                    <IoChevronDownCircleOutline className="w-4 h-4 text-foreground/80" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-[220px] bg-[#1a1a1a] border border-border rounded-lg"
                align="start"
                side="top"
                sideOffset={8}
            >
                <DropdownMenuLabel className="px-2 py-1.5 text-xs text-foreground/60 font-medium">
                    Conversation mode
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border" />

                {MODE_CONFIGS.map((config) => {
                    const ModeIcon = config.icon;
                    return (
                        <DropdownMenuItem
                            key={config.mode}
                            onClick={() => onModeChange(config.mode)}
                            className="flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-[#262626] cursor-pointer focus:bg-[#262626] outline-none"
                        >
                            <ModeIcon className="w-5 h-5 text-foreground/80 flex-shrink-0" />
                            <div className="flex-1 text-left min-w-0">
                                <div className="text-sm font-medium text-foreground">
                                    {config.label}
                                </div>
                                <div className="text-xs text-foreground/50">
                                    {config.description}
                                </div>
                            </div>
                            {currentMode === config.mode && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
