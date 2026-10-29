import { observer } from 'mobx-react-lite';

const tabs = [
    { label: 'Dashboard', icon: '⌂' },
    { label: 'Bot Builder', icon: '⚙' },
    { label: 'Trading Bots', icon: '▣' },
    { label: 'Bulk Trader', icon: '⇄' },
    { label: 'Pro AI', icon: '✧' },
    { label: 'Dual Edge', icon: '⟳' },
    { label: 'Analysis Tool', icon: '⌕' },
    { label: 'Copy Trading', icon: '▤' },
    { label: 'Charts', icon: '⌁' },
    { label: 'Risk Calculator', icon: '▦' },
    { label: 'Manual Trader', icon: '✎' },
    { label: 'TradingView', icon: '♧' },
];

export const MenuItems = observer(() => {
    const handleTabClick = (label: string) => {
        window.dispatchEvent(new CustomEvent('novatrade:placeholder-tab', { detail: label }));
    };

    return (
        <nav
            aria-label='OneMan Trade navigation'
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                width: '100%',
                minWidth: 0,
                overflowX: 'auto',
                overflowY: 'hidden',
                whiteSpace: 'nowrap',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                padding: '6px 8px',
                boxSizing: 'border-box',
            }}
        >
            {tabs.map(tab => (
                <button
                    key={tab.label}
                    type='button'
                    onClick={() => handleTabClick(tab.label)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        flex: '0 0 auto',
                        border: '1px solid var(--border-normal, #d7dce0)',
                        borderRadius: 6,
                        padding: '7px 10px',
                        background: 'var(--general-section-1, #fff)',
                        color: 'var(--text-prominent, #222)',
                        fontSize: 12,
                        lineHeight: '16px',
                        cursor: 'pointer',
                    }}
                >
                    <span aria-hidden='true'>{tab.icon}</span>
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
});

export const TradershubLink = observer(() => null);

type MenuItemsType = typeof MenuItems & {
    TradershubLink: typeof TradershubLink;
};

(MenuItems as MenuItemsType).TradershubLink = TradershubLink;

export default MenuItems as MenuItemsType;
