import betterDevLogo from '../../assets/dev-logo-light.png';

export function Header() {
    return (
        <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
                <img
                    src={betterDevLogo}
                    alt="better DEV Logo"
                    className="w-8 h-8 object-contain"
                />
            </div>
            <h1 className="text-xl font-brand">better DEV</h1>
        </div>
    );
};