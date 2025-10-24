import { GoPlusCircle } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface FeaturesProps {}

export function Features({}: FeaturesProps) {
    const navigate = useNavigate();

    const handleNewChat = () => {
        navigate(ROUTES.NEW);
    };

    return (
        <div className="p-4 flex flex-col gap-2">
            <div className="text-xs font-medium text-foreground/50 px-2">
                Features
            </div>
            <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 text-left px-3 py-1.5 rounded-lg hover:bg-[#262626] transition-smooth"
            >
                <GoPlusCircle className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">
                    New chat
                </span>
            </button>
        </div>
    );
};