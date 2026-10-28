import { useEffect, useState } from 'react';
import './novatrade-loading.scss';

type NovaTradeLoadingProps = {
    status?: string;
    fullscreen?: boolean;
};

const NovaTradeLoading = ({ status = 'Connecting to Volatility Markets...', fullscreen = true }: NovaTradeLoadingProps) => {
    const [progress, setProgress] = useState(8);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setProgress(current => (current >= 92 ? 92 : Math.min(92, current + Math.max(1, Math.round((92 - current) / 15)))));
        }, 160);
        return () => window.clearInterval(timer);
    }, []);

    return (
        <div className={`nt-loading ${fullscreen ? 'nt-loading--fullscreen' : 'nt-loading--embedded'}`} role='status' aria-live='polite'>
            <div className='nt-loading__ambient nt-loading__ambient--one' />
            <div className='nt-loading__ambient nt-loading__ambient--two' />
            <section className='nt-loading__panel' aria-label='NovaTrade loading'>
                <header className='nt-loading__brand'>
                    <div className='nt-loading__wordmark'><span>Nova</span><b>Trade</b></div>
                    <div className='nt-loading__subbrand'>T R A D I N G&nbsp; H U B <span className='nt-loading__live'><i /> LIVE</span></div>
                </header>
                <div className='nt-loading__rule' />
                <div className='nt-loading__welcome'>
                    <h1>Welcome to NovaTrade</h1>
                    <p>Empowering your trading journey.</p>
                </div>
                <div className='nt-loading__progress-row'>
                    <div className='nt-loading__track'><span style={{ width: `${progress}%` }} /></div>
                    <strong>{progress}%</strong>
                </div>
                <div className='nt-loading__status'><span className='nt-loading__spinner' /><p>{status}</p></div>
                <div className='nt-loading__dots' aria-hidden='true'><i /><i /><i /><i /><i /><i /></div>
                <div className='nt-loading__features'>
                    <div><span>📊</span><b>Advanced Charts</b></div>
                    <div><span>🤖</span><b>Trading Bots</b></div>
                    <div><span>🔁</span><b>Strategy Tools</b></div>
                </div>
                <p className='nt-loading__footnote'>Preparing a seamless trading experience for you</p>
            </section>
            {fullscreen && <div className='nt-loading__ticker' aria-hidden='true'><span>MARKET DATA</span><b>● LIVE</b><span>VOLATILITY MARKETS</span><b>● CONNECTING</b><span>TRADING TOOLS</span></div>}
        </div>
    );
};

export default NovaTradeLoading;
