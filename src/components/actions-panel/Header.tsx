import { IoChevronBackOutline } from 'react-icons/io5';

interface HeaderProps {
    onCollapse?: () => void;
}

export function Header({ onCollapse }: HeaderProps) {
    return (
        <div className="p-4 pr-2 flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                <img
                    src="/dev-logo-light.png"
                    alt="better DEV Logo"
                    className="w-7 h-7 object-contain"
                />
            </div>
            <h1 className="flex-1 min-w-0 truncate text-[15px] font-brand leading-none">better DEV</h1>
            {/* Collapse the sidebar (desktop) — reopen pill appears at the screen edge */}
            {onCollapse && (
                <button
                    onClick={onCollapse}
                    className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface-hover transition-smooth"
                    title="Hide menu"
                >
                    <IoChevronBackOutline className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};