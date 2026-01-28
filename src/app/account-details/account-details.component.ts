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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../data/data.service';
import { AccountBalances, type Transaction } from '../data/interfaces';
import { MonthYearPipe } from '../shared/pipes/month-year.pipe';

type AccountType = 'currentExpenses' | 'repairs';

@Component({
  selector: 'vh-account-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MonthYearPipe,
  ],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss',
})
export class AccountDetailsComponent implements OnInit {
  accountType: AccountType | null = null;
  accountName: string = '';
  accountBalance: number = 0;
  transactions: Transaction[] = [];
  incomeTotal: number = 0;
  expenseTotal: number = 0;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private dataService = inject(DataService);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const type = params['type'] as AccountType;
      if (type === 'currentExpenses' || type === 'repairs') {
        this.accountType = type;
        this.accountName =
          type === 'currentExpenses'
            ? 'Сметка за текущи разходи'
            : 'Сметка за ремонти';
        this.loadAccountData();
      } else {
        this.accountType = null;
      }
    });
  }

  loadAccountData() {
    if (!this.accountType) return;

    const accountType = this.accountType; // Store in local variable for TypeScript

    // Load account balance and transactions together to calculate current balance
    this.dataService.loadData().subscribe((data) => {
      const balance2025 =
        accountType === 'currentExpenses'
          ? data.accountBalances.expensesBalance2025
          : data.accountBalances.repairsBalance2025;

      // Load transactions
      this.dataService
        .loadAccountTransactions(accountType)
        .subscribe((transactions) => {
          this.transactions = transactions.sort((a, b) => {
            const dateA = this.parseDate(a.date);
            const dateB = this.parseDate(b.date);
            return dateB - dateA; // Most recent first
          });

          this.incomeTotal = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

          this.expenseTotal = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

          // Calculate current balance: balance from 2025 + income - expenses
          this.accountBalance =
            balance2025 + this.incomeTotal - this.expenseTotal;

          this.cdr.detectChanges();
        });
    });
  }

  private parseDate(value: string): number {
    const parts = value.split('-');
    if (parts.length !== 3) {
      return Number.NEGATIVE_INFINITY;
    }
    const day = Number(parts[0]);
    const mon = parts[1];
    const year = Number(parts[2]);
    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const month = monthMap[mon];
    if (month === undefined || Number.isNaN(day) || Number.isNaN(year)) {
      return Number.NEGATIVE_INFINITY;
    }
    return new Date(year, month, day).getTime();
  }

  getAccountIcon(): string {
    return this.accountType === 'currentExpenses'
      ? 'account_balance'
      : 'home_repair_service';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getBalance(): number {
    return this.incomeTotal - this.expenseTotal;
  }
}
