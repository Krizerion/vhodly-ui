import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { Apartment, Floor } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class CsvDataService {
  private http = inject(HttpClient);

  // Path to CSV files in assets folder
  // Note: In Angular, assets are served from root, so use 'assets/data/' not '/assets/data/'
  private readonly CSV_BASE_PATH = 'assets/data/';

  /**
   * Load apartments/floors data from CSV file
   */
  loadFloors(): Observable<Floor[]> {
    return this.loadFloorsFromCsv();
  }

  /**
   * Load floors and apartments from CSV file
   */
  private loadFloorsFromCsv(): Observable<Floor[]> {
    return this.http
      .get(`${this.CSV_BASE_PATH}Apartments.csv`, { responseType: 'text' })
      .pipe(
        map((csvText) => {
          const rows = this.parseCsv(csvText);
          if (rows.length < 2) {
            return [];
          }
          // Skip header row
          const dataRows = rows.slice(1);

          // Group by floor
          const floorsMap = new Map<number, Apartment[]>();

          dataRows.forEach((row, index) => {
            const floorNum = parseInt(row[0] || '0', 10);

            // Check if apartment number is empty (empty apartment slot)
            const aptNumberStr = row[1]?.trim() || '';
            const aptNumber = aptNumberStr ? parseInt(aptNumberStr, 10) : null;

            // If no floor number, find the last valid floor number
            if (floorNum === 0) {
              let lastFloor = 1;
              for (let i = index - 1; i >= 0; i--) {
                const prevFloor = parseInt(dataRows[i][0] || '0', 10);
                if (prevFloor > 0) {
                  lastFloor = prevFloor;
                  break;
                }
              }
              if (!floorsMap.has(lastFloor)) {
                floorsMap.set(lastFloor, []);
              }
              floorsMap.get(lastFloor)!.push({ number: null });
              return;
            }

            // If floor number exists but apartment number is empty, add empty slot to that floor
            if (!aptNumber) {
              if (!floorsMap.has(floorNum)) {
                floorsMap.set(floorNum, []);
              }
              floorsMap.get(floorNum)!.push({ number: null });
              return;
            }

            // Parse apartment data
            const residentsCount = row[2]?.trim()
              ? parseInt(row[2], 10)
              : undefined;
            // Handle comma as decimal separator (European format)
            const repairsFee = row[3]?.trim()
              ? parseFloat(row[3].replace(',', '.'))
              : undefined;
            const currentExpensesFee = row[4]?.trim()
              ? parseFloat(row[4].replace(',', '.'))
              : undefined;
            const totalDebt = row[5]?.trim()
              ? parseFloat(row[5].replace(',', '.'))
              : undefined;
            const lastPaymentDate = row[6]?.trim() || undefined;

            const apartment: Apartment = {
              number: aptNumber,
              residentsCount,
              repairsFee,
              currentExpensesFee,
              totalDebt,
              lastPaymentDate,
            };

            if (!floorsMap.has(floorNum)) {
              floorsMap.set(floorNum, []);
            }
            floorsMap.get(floorNum)!.push(apartment);
          });

          // Convert map to array and sort by floor number
          return Array.from(floorsMap.entries())
            .map(([number, apartments]) => ({ number, apartments }))
            .sort((a, b) => a.number - b.number);
        }),
      );
  }

  /**
   * Parse CSV text into array of arrays
   */
  private parseCsv(csvText: string): string[][] {
    // Handle Windows line endings (\r\n) and normalize to \n
    const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText
      .split('\n')
      .filter((line) => line.trim().length > 0);
    const result: string[][] = [];

    for (const line of lines) {
      const row: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            current += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      // Add last field
      row.push(current.trim());

      // Only add non-empty rows
      if (row.some((cell) => cell.length > 0)) {
        result.push(row);
      }
    }

    return result;
  }
}
