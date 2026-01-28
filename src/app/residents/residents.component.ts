import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  type OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../data/data.service';
import type { Announcement, Apartment, Floor } from '../data/interfaces';

@Component({
  selector: 'vh-residents',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './residents.component.html',
  styleUrl: './residents.component.scss',
})
export class ResidentsComponent implements OnInit {
  announcements: Announcement[] = [];
  currentExpensesBalance = 0;
  currentRepairsBalance = 0;
  floors: Floor[] = [];
  lastUpdate = '19 януари 2026';

  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.dataService.loadData().subscribe((data) => {
      this.announcements = [...data.announcements];
      this.floors = [...data.floors].reverse();

      // Calculate current balances: balance from 2025 + income - expenses for 2026
      const expensesBalance2025 = data.accountBalances.expensesBalance2025;
      const repairsBalance2025 = data.accountBalances.repairsBalance2025;

      // Load transactions for current expenses
      this.dataService
        .loadAccountTransactions('currentExpenses')
        .subscribe((transactions) => {
          const income = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const expenses = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          this.currentExpensesBalance = expensesBalance2025 + income - expenses;
          this.cdr.detectChanges();
        });

      // Load transactions for repairs
      this.dataService
        .loadAccountTransactions('repairs')
        .subscribe((transactions) => {
          const income = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const expenses = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          this.currentRepairsBalance = repairsBalance2025 + income - expenses;
          this.cdr.detectChanges();
        });

      // Force change detection
      this.cdr.detectChanges();
    });
  }

  openApartmentDetails(apartment: Apartment): void {
    if (!apartment.number) {
      return;
    }

    this.router.navigate(['/apartment', apartment.number]);
  }

  openAccountDetails(accountType: 'currentExpenses' | 'repairs'): void {
    this.router.navigate(['/account', accountType]);
  }
}
