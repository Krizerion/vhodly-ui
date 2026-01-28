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
import type { Bill } from '../data/interfaces';
import { MonthYearPipe } from '../shared/pipes/month-year.pipe';

@Component({
  selector: 'vh-bills',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MonthYearPipe,
  ],
  templateUrl: './bills.html',
  styleUrl: './bills.scss',
})
export class BillsComponent implements OnInit {
  bills: Bill[] = [];

  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.dataService.loadBills().subscribe({
      next: (bills) => {
        // Use arrow comparator to keep `this` context for helper methods
        this.bills = [...bills].sort((a, b) =>
          this.sortByMostRecentlyPaid(a, b),
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.bills = [];
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getBillIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      Електричество: 'bolt',
      Вода: 'water_drop',
      Отопление: 'whatshot',
      'Общи части': 'apartment',
    };
    return iconMap[type] || 'receipt';
  }

  private sortByMostRecentlyPaid(a: Bill, b: Bill): number {
    const aTs = this.getPaidTimestamp(a);
    const bTs = this.getPaidTimestamp(b);
    // Desc (most recent first)
    return bTs - aTs;
  }

  private getPaidTimestamp(bill: Bill): number {
    if (!bill.paid || !bill.paidDate) {
      // Unpaid / missing paid date should go to the bottom
      return Number.NEGATIVE_INFINITY;
    }
    return this.parseDate(bill.paidDate);
  }

  private parseDate(value: string): number {
    // "31-Dec-2025" -> timestamp
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
}
