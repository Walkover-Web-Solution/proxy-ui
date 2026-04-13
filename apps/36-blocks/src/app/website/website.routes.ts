import { Route } from '@angular/router';

export const websiteRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./layout/website-layout.component').then((c) => c.WebsiteLayoutComponent),
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent),
            },
            {
                path: 'pricing',
                loadComponent: () => import('./pricing/pricing.component').then((c) => c.PricingComponent),
            },
            {
                path: 'security',
                loadComponent: () => import('./security/security.component').then((c) => c.SecurityComponent),
            },
            {
                path: 'privacy',
                loadComponent: () => import('./privacy/privacy.component').then((c) => c.PrivacyComponent),
            },
            {
                path: 'terms',
                loadComponent: () => import('./terms/terms.component').then((c) => c.TermsComponent),
            },
            {
                path: 'about',
                loadComponent: () => import('./about/about.component').then((c) => c.AboutComponent),
            },
            {
                path: 'contact',
                loadComponent: () => import('./contact/contact.component').then((c) => c.ContactComponent),
            },
        ],
    },
];
