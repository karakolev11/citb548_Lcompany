import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadComponent: () =>
            import('./layouts/auth-layout/auth-layout.component')
                .then(c => c.AuthLayoutComponent),
        children: [
            {
                path: 'login',
                loadComponent: () =>
                    import('./auth/components/login/login.component')
                        .then(c => c.LoginComponent)
            }
        ]
    },
];
