import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        path: '',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'app/**',
        renderMode: RenderMode.Client,
    },
    {
        path: 'widget-preview/**',
        renderMode: RenderMode.Client,
    },
    {
        path: 'project',
        renderMode: RenderMode.Client,
    },
    {
        path: 'client/**',
        renderMode: RenderMode.Client,
    },
    {
        path: '**',
        renderMode: RenderMode.Client,
    },
];
