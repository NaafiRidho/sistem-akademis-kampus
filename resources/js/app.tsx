import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import LoadingBar from './Components/LoadingBar';

const appName = import.meta.env.VITE_APP_NAME || 'Sistem Akademis Kampus';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <LoadingBar />
                <App {...props} />
            </>
        );
    },
    progress: {
        delay: 250,
        color: '#4F46E5',
        includeCSS: true,
        showSpinner: false,
    },
});
