import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./residents/residents.component').then(
        (m) => m.ResidentsComponent,
      ),
  },
  {
    path: 'apartment/:id',
    loadComponent: () =>
      import('./apartment-details/apartment-details.component').then(
        (m) => m.ApartmentDetailsComponent,
      ),
  },
  {
    path: 'bills',
    loadComponent: () => import('./bills/bills').then((m) => m.BillsComponent),
  },
  {
    path: 'account/:type',
    loadComponent: () =>
      import('./account-details/account-details.component').then(
        (m) => m.AccountDetailsComponent,
      ),
  },
];
