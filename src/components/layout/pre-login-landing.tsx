import { useState } from 'react';
import { generateOAuthURL } from '@/components/shared';
import './pre-login-landing.scss';

type AuthAction = 'login' | 'signup';

const PreLoginLanding = () => {
    const [loading, setLoading] = useState<AuthAction | null>(null);
    const [authError, setAuthError] = useState('');

    const startAuth = async (action: AuthAction) => {
        if (loading) return;
        setLoading(action);
        setAuthError('');
        try {
            const url = await generateOAuthURL(action === 'signup' ? 'registration' : undefined);
            if (url) {
                window.location.assign(url);
                return;
            }
            setAuthError('We could not start Deriv sign-in. Please refresh and try again.');
        } catch (error) {
            console.error('Authentication redirect failed:', error);
            setAuthError('We could not start Deriv sign-in. Please refresh and try again.');
        }
        setLoading(null);
    };

    return (
        <main className='om-landing'>
            <header className='om-landing__header'>
                <a className='om-landing__brand' href='/' aria-label='OneMan Trade home'>
                    <span className='om-landing__brand-one'>One</span><span className='om-landing__brand-man'>Man</span><span className='om-landing__brand-trade'>Trade</span>
                </a>
                <div className='om-landing__header-actions'>
                    <button className='om-button om-button--light' onClick={() => startAuth('login')} disabled={!!loading}>
                        {loading === 'login' ? 'Connecting…' : 'Log in now'} <span aria-hidden='true'>→</span>
                    </button>
                    <button className='om-button om-button--signup' onClick={() => startAuth('signup')} disabled={!!loading}>
                        {loading === 'signup' ? 'Connecting…' : 'Sign up'}
                    </button>
                </div>
            </header>

            <section className='om-hero'>
                <div className='om-hero__greeting'>Good trading starts with a plan</div>
                <h1>Welcome to <span className='om-brand-gradient'>OneMan Trade</span></h1>
                <p className='om-hero__copy'>Your all-in-one workspace for automated trading, visual bots, and market insights.</p>
                <div className='om-highlight-card'>
                    <div className='om-highlight-card__avatar' aria-hidden='true'>OM</div>
                    <div className='om-highlight-card__quote-mark'>”</div>
                    <p>Build strategies visually, explore market charts, and stay in control of your trading workflow.</p>
                    <strong>OneMan Trade</strong>
                    <span>Trading tools in one workspace</span>
                    <div className='om-highlight-card__stars' aria-label='Four feature highlights'>✦　✦　✦　✦　✦</div>
                </div>
                <div className='om-stats' aria-label='Platform capabilities'>
                    <div><span>BOT</span><small>Visual Builder</small></div>
                    <div><span>LIVE</span><small>Market Charts</small></div>
                    <div><span>DEMO</span><small>Test Strategies</small></div>
                    <div><span>24/7</span><small>Access Online</small></div>
                </div>
            </section>

            <section className='om-section' id='features'>
                <span className='om-section__eyebrow'>PLATFORM</span>
                <h2>Powerful Features for Modern Traders</h2>
                <p className='om-section__lead'>Everything you need to explore strategies and organize your trading workflow.</p>
                <div className='om-feature-grid'>
                    <article className='om-feature-card om-feature-card--cyan'>
                        <span className='om-feature-card__icon'>▣</span>
                        <h3>AI-Powered Trading Bots</h3><b>Automate Your Workflow</b>
                        <p>Configure visual trading strategies with the bot builder. Review your setup and test carefully before running.</p>
                    </article>
                    <article className='om-feature-card om-feature-card--green'>
                        <span className='om-feature-card__icon'>▥</span>
                        <h3>Real-Time Market Analysis</h3><b>Data-Informed Decisions</b>
                        <p>Explore available charts, indicators, and market information to help you study market movements.</p>
                    </article>
                    <article className='om-feature-card om-feature-card--purple'>
                        <span className='om-feature-card__icon'>♧</span>
                        <h3>Strategy Tools</h3><b>Build Your Approach</b>
                        <p>Start from a quick strategy or build your own bot using the visual block-based editor.</p>
                    </article>
                    <article className='om-feature-card om-feature-card--cyan'>
                        <span className='om-feature-card__icon'>⬡</span>
                        <h3>Risk Management</h3><b>Keep Risk in View</b>
                        <p>Review trade settings, use demo mode to learn the workflow, and never risk money you cannot afford to lose.</p>
                    </article>
                </div>
            </section>

            <section className='om-referral'>
                <span className='om-referral__eyebrow'>DERIV CONNECTION</span>
                <h2>One workspace. Your trading tools.</h2>
                <p>Connect through Deriv to access the trading workspace. Sign-in and account permissions are handled through Deriv.</p>
                <button className='om-button om-button--referral' onClick={() => startAuth('signup')} disabled={!!loading}>
                    {loading === 'signup' ? 'Connecting…' : 'Connect with Deriv'} <span aria-hidden='true'>→</span>
                </button>
            </section>

            <section className='om-community'>
                <span className='om-section__eyebrow'>BUILT FOR TRADERS</span>
                <h2>Tools to support your trading workflow</h2>
                <p>Explore the platform, build a strategy, and take time to understand the risks before trading.</p>
                <div className='om-community__pills'><span>✓ Visual bot builder</span><span>✓ Charts and indicators</span><span>✓ Demo-first approach</span></div>
            </section>

            <section className='om-why'>
                <span className='om-section__eyebrow'>WHY ONEMAN TRADE</span>
                <h2>A focused workspace for your strategy</h2>
                <p>Use the tools available in the platform at your own pace.</p>
                <ul>
                    <li>✓ Visual block-based bot building</li>
                    <li>✓ Market charts and indicator tools</li>
                    <li>✓ Deriv account connection</li>
                    <li>✓ Explore strategies before running them</li>
                    <li>✓ Demo testing encouraged</li>
                    <li>✓ Mobile-friendly public landing page</li>
                </ul>
            </section>

            <section className='om-cta'>
                <span className='om-section__eyebrow'>GET STARTED</span>
                <h2>Ready to explore your trading workspace?</h2>
                <p>Connect your Deriv account and start with a strategy you understand.</p>
                <button className='om-button om-button--primary' onClick={() => startAuth('signup')} disabled={!!loading}>
                    {loading === 'signup' ? 'Connecting to Deriv…' : 'Get started'} <span aria-hidden='true'>→</span>
                </button>
                <div className='om-cta__notes'><span>✓ Demo testing encouraged</span><span>✓ Deriv sign-in</span><span>✓ Review risk first</span></div>
            </section>

            {authError && <p className='om-landing__error' role='alert'>{authError}</p>}

            <footer className='om-footer' id='risk'>
                <div className='om-footer__brand'><span className='om-landing__brand-one'>One</span><span className='om-landing__brand-man'>Man</span><span className='om-landing__brand-trade'>Trade</span></div>
                <div className='om-footer__risk'><strong>⚠ Risk Disclaimer</strong><p>Deriv offers complex derivatives, including options and CFDs. These products may not be suitable for all clients, and trading them puts you at risk. You may lose some or all of the money you invest. Currency conversion can affect profit and loss. Never trade with borrowed money or money you cannot afford to lose.</p></div>
                <div className='om-footer__bottom'><span>© {new Date().getFullYear()} OneMan Trade</span><span>Trading involves risk. No profits are guaranteed.</span></div>
            </footer>
        </main>
    );
};

export default PreLoginLanding;
