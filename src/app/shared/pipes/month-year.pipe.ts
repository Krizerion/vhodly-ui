import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthYear',
  standalone: true,
})
export class MonthYearPipe implements PipeTransform {
  private monthMap: { [key: string]: string } = {
    Jan: 'Януари',
    Feb: 'Февруари',
    Mar: 'Март',
    Apr: 'Април',
    May: 'Май',
    Jun: 'Юни',
    Jul: 'Юли',
    Aug: 'Август',
    Sep: 'Септември',
    Oct: 'Октомври',
    Nov: 'Ноември',
    Dec: 'Декември',
  };

  transform(value: string | undefined | null): string {
    if (!value) {
      return 'Няма данни';
    }

    // Parse format: "25-Jan-2025" or "25-Jan-2024"
    const parts = value.split('-');
    if (parts.length !== 3) {
      return value; // Return as-is if format is unexpected
    }

    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    const bulgarianMonth = this.monthMap[month];
    if (!bulgarianMonth) {
      return value; // Return as-is if month not found
    }

    return `${day} ${bulgarianMonth} ${year}`;
  }
}
