import { Routes } from '@angular/router';
import { AlreadyAuthenticatedGuard } from './auth/guards/already-authenticated.guard';
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';

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
        canActivate: [AuthGuard],
        loadComponent: () =>
            import('./layouts/app-layout/app-layout.component')
                .then(c => c.AppLayoutComponent),
        children: [
            {
                path: 'companies',
                canActivate: [RoleGuard],
                data: { roles: [1, 2] },
                loadComponent: () =>
                    import('./features/companies-page/companies-page.component')
                        .then(c => c.CompaniesPageComponent)
            },
            {
                path: 'users',
                canActivate: [RoleGuard],
                data: { roles: [1, 2] },
                loadComponent: () =>
                    import('./features/users-page/users-page.component')
                        .then(c => c.UsersPageComponent)
            },
            {
                path: 'shipments',
                canActivate: [RoleGuard],
                data: { roles: [1, 2, 3] },
                loadComponent: () =>
                    import('./features/shipments-page/shipments-page.component')
                        .then(c => c.ShipmentsPageComponent)
            },
            {
                path: 'reports',
                canActivate: [RoleGuard],
                data: { roles: [1, 2] },
                loadComponent: () =>
                    import('./features/reports-page/reports-page.component')
                        .then(c => c.ReportsPageComponent)
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'shipments'
            }
        ]
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth/login',
    },
    {
        path: '**',
        redirectTo: 'auth/login',
    }
];
