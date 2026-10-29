import { lazy, Suspense } from 'react';
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import LocalStorageSyncWrapper from '@/components/localStorage-sync-wrapper';
import RoutePromptDialog from '@/components/route-prompt-dialog';
import { useAccountSwitching } from '@/hooks/useAccountSwitching';
import { useLanguageFromURL } from '@/hooks/useLanguageFromURL';
import { useOAuthCallback } from '@/hooks/useOAuthCallback';
import { StoreProvider } from '@/hooks/useStore';
import { OAuthTokenExchangeService } from '@/services/oauth-token-exchange.service';
import { initializeI18n, localize, TranslationProvider } from '@deriv-com/translations';
import CoreStoreProvider from './CoreStoreProvider';
import './app-root.scss';

const Layout = lazy(() => import('../components/layout'));
const AppRoot = lazy(() => import('./app-root'));

// Translations CDN is optional — requires TRANSLATIONS_CDN_URL, R2_PROJECT_NAME, and CROWDIN_BRANCH_NAME env vars.
// Without these, the app defaults to English. See user-guide/03-white-labeling.md#translations for setup instructions.
const i18nInstance = initializeI18n({ cdnUrl: '' });

/**
 * Component wrapper to handle language URL parameter
 * Uses the useLanguageFromURL hook to process language switching
 */
const LanguageHandler = ({ children }: { children: React.ReactNode }) => {
    useLanguageFromURL();
    return <>{children}</>;
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path='/'
            element={
                <Suspense
                    fallback={<ChunkLoader message={localize('Please wait while we connect to the server...')} />}
                >
                    <TranslationProvider defaultLang='EN' i18nInstance={i18nInstance}>
                        <LanguageHandler>
                            <StoreProvider>
                                <LocalStorageSyncWrapper>
                                    <RoutePromptDialog />
                                    <CoreStoreProvider>
                                        <Layout />
                                    </CoreStoreProvider>
                                </LocalStorageSyncWrapper>
                            </StoreProvider>
                        </LanguageHandler>
                    </TranslationProvider>
                </Suspense>
            }
        >
            {/* All child routes will be passed as children to Layout */}
            <Route index element={<AppRoot />} />
        </Route>
    )
);

/**
 * Main App component
 *
 * Responsibilities:
 * 1. OAuth callback handling (via useOAuthCallback hook)
 * 2. Account switching from URL (via useAccountSwitching hook)
 * 3. Router provider setup
 *
 * All complex logic has been extracted into custom hooks for better maintainability
 */
function App() {
    const [oauthLoginError, setOAuthLoginError] = React.useState('');

    // Handle OAuth callback flow (CSRF validation + code extraction)
    const { isProcessing, isValid, params, error, cleanupURL } = useOAuthCallback();

    // Handle account switching via URL parameter
    useAccountSwitching();

    // Process the authorization code when OAuth callback is valid
    React.useEffect(() => {
        if (!isProcessing && isValid && params.code) {
            // Exchange authorization code for access token
            OAuthTokenExchangeService.exchangeCodeForToken(params.code)
                .then(response => {
                    if (response.access_token) {
                        cleanupURL();
                    } else if (response.error) {
                        const message = response.error_description || response.error;
                        console.error('❌ Token exchange failed:', response.error, message);
                        setOAuthLoginError(message);
                        cleanupURL();
                    }
                })
                .catch(error => {
                    const message = error instanceof Error ? error.message : 'The sign-in request failed.';
                    console.error('❌ Token exchange request failed:', error);
                    setOAuthLoginError(message);
                    cleanupURL();
                });
        } else if (!isProcessing && error) {
            console.error('OAuth callback error:', error);
            setOAuthLoginError(error);
        }
    }, [isProcessing, isValid, params.code, error, cleanupURL]);

    return (
        <>
            <RouterProvider router={router} />
            {oauthLoginError && (
                <div
                    role='alert'
                    style={{
                        position: 'fixed',
                        zIndex: 100000,
                        left: '16px',
                        right: '16px',
                        bottom: '16px',
                        maxWidth: '560px',
                        margin: '0 auto',
                        padding: '16px',
                        borderRadius: '12px',
                        background: '#351b1b',
                        color: '#ffffff',
                        border: '1px solid #d65b5b',
                        boxShadow: '0 8px 30px rgba(0,0,0,.35)',
                    }}
                >
                    <strong>Deriv sign-in failed</strong>
                    <p style={{ margin: '8px 0', overflowWrap: 'anywhere' }}>{oauthLoginError}</p>
                    <p style={{ margin: '0 0 12px', fontSize: '13px' }}>
                        Your account has not been signed in. Please try again. Do not share access tokens or passwords.
                    </p>
                    <button
                        type='button'
                        onClick={() => setOAuthLoginError('')}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #ffffff',
                            background: 'transparent',
                            color: '#ffffff',
                            cursor: 'pointer',
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </>
    );
}

export default App;
