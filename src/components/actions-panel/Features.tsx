import { GoPlusCircle } from "react-icons/go";

interface FeaturesProps {
    handleNewChat: () => void;
    creating: boolean;
}

export function Features({ handleNewChat, creating }: FeaturesProps) {

    return (
        <div className="p-4 flex flex-col gap-2">
            <div className="text-xs font-medium text-foreground/50 px-2">
                Features
            </div>
            <button
                onClick={handleNewChat}
                disabled={creating}
                className="w-full flex items-center gap-3 text-left px-3 py-1.5 rounded-lg hover:bg-[#262626] transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <GoPlusCircle className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">
                    {creating ? 'Creating...' : 'New chat'}
                </span>
            </button>
        </div>
    );
};