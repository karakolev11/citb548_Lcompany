import { Routes } from '@angular/router';
import { AlreadyAuthenticatedGuard } from './auth/guards/already-authenticated.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadComponent: () =>
            import('./layouts/auth-layout/auth-layout.component')
                .then(c => c.AuthLayoutComponent),
        children: [
            {
                path: 'login',
                canActivate: [AlreadyAuthenticatedGuard],
                loadComponent: () =>
                    import('./auth/components/login/login.component')
                        .then(c => c.LoginComponent)
            },
            {
                path: 'register',
                canActivate: [AlreadyAuthenticatedGuard],
                loadComponent: () =>
                    import('./auth/components/register/register.component')
                        .then(c => c.RegisterComponent)
            }
        ]
    },
    {
        path: 'app',
        loadComponent: () =>
            import('./layouts/app-layout/app-layout.component')
                .then(c => c.AppLayoutComponent)
    },
];
