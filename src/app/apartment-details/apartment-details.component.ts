import { CommonModule } from '@angular/common';
import {
  type AfterViewChecked,
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  type ElementRef,
  inject,
  type OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../data/data.service';
import type { Apartment } from '../data/interfaces';
import { TippyDirective } from '../shared/directives/tippy.directive';
import { MonthYearPipe } from '../shared/pipes/month-year.pipe';

@Component({
  selector: 'vh-apartment-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MonthYearPipe,
    TippyDirective,
  ],
  templateUrl: './apartment-details.component.html',
  styleUrl: './apartment-details.component.scss',
})
export class ApartmentDetailsComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  apartment: Apartment | null = null;
  floorNumber: number | null = null;
  tooltipHtml: string = '';

  @ViewChild('tooltipContainer', { static: false })
  tooltipContainer!: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private dataService = inject(DataService);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const apartmentNumber = parseInt(params['id'], 10);
      if (!isNaN(apartmentNumber)) {
        this.findApartment(apartmentNumber);
      }
    });
  }

  findApartment(apartmentNumber: number) {
    this.dataService.loadData().subscribe((data) => {
      for (const floor of data.floors) {
        const apt = floor.apartments.find((a) => a.number === apartmentNumber);
        if (apt) {
          // Create a copy to ensure change detection
          this.apartment = { ...apt };
          this.floorNumber = floor.number;
          // Update tooltip HTML immediately with correct data
          this.updateTooltipHtml();
          return;
        }
      }
      this.apartment = null;
      this.floorNumber = null;
      this.tooltipHtml = '';
    });
  }

  ngAfterViewInit() {
    // Initial update after view is initialized
    if (this.apartment) {
      this.updateTooltipHtml();
    }
  }

  ngAfterViewChecked() {
    // Update tooltip HTML when view changes, but only if apartment exists and tooltip is empty
    if (this.apartment && !this.tooltipHtml) {
      this.updateTooltipHtml();
    }
  }

  private updateTooltipHtml() {
    if (!this.apartment) {
      this.tooltipHtml = '';
      return;
    }

    const repairsFee = this.apartment.repairsFee || 0;
    const currentExpensesFee = this.apartment.currentExpensesFee || 0;
    const monthlyFee = repairsFee + currentExpensesFee;
    const residentsCount = this.apartment.residentsCount || 0;

    // Determine fee per person based on floor
    const feePerPerson =
      this.floorNumber !== null &&
      this.floorNumber !== undefined &&
      this.floorNumber <= 2
        ? 1.5
        : 4.0;
    const floorRange =
      this.floorNumber !== null &&
      this.floorNumber !== undefined &&
      this.floorNumber <= 2
        ? '1-2'
        : '3-8';

    // Format numbers with 2 decimal places (using dot as decimal separator for consistency)
    const formatNumber = (num: number): string => {
      return num.toFixed(2);
    };

    let residentsText = '';
    if (residentsCount > 0) {
      const peopleText = residentsCount === 1 ? 'човек' : 'човека';
      residentsText = `
        <div class="fee-tooltip-note">
          ${residentsCount} ${peopleText} × €${formatNumber(feePerPerson)}
          за ${floorRange} етаж
        </div>`;
    } else {
      residentsText = '<div class="fee-tooltip-note">няма живущи</div>';
    }

    const html = `
      <div class="fee-tooltip-content">
        <div class="fee-tooltip-header">
          Месечна такса: <strong>€${formatNumber(monthlyFee)}</strong>
        </div>
        <div class="fee-tooltip-divider"></div>
        <div class="fee-tooltip-section">
          <div class="fee-tooltip-row">
            <span class="fee-label">Ремонти</span>
            <span class="fee-amount">€${formatNumber(repairsFee)}</span>
          </div>
          <div class="fee-tooltip-destination">→ Сметка за ремонти</div>
          <div class="fee-tooltip-note">(фиксирана такса)</div>
        </div>
        <div class="fee-tooltip-section">
          <div class="fee-tooltip-row">
            <span class="fee-label">Текущи разходи</span>
            <span class="fee-amount">€${formatNumber(currentExpensesFee)}</span>
          </div>
          <div class="fee-tooltip-destination">→ Сметка за текущи разходи</div>
          ${residentsText}
        </div>
      </div>`;

    if (this.tooltipHtml !== html) {
      this.tooltipHtml = html;
      this.cdr.detectChanges();
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getMonthlyFee(): number {
    if (!this.apartment) return 0;
    const repairsFee = this.apartment.repairsFee || 0;
    const currentExpensesFee = this.apartment.currentExpensesFee || 0;
    return repairsFee + currentExpensesFee;
  }
}
