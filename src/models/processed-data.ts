import { Tax } from './tax';
import { TaxTable } from './tax-table';
import { TaxTotals } from './tax-totals';

export interface ProcessedData {
  tables: {
    collapse: Tax[];
    [key: string]: Tax[];
  };
  totals: {
    collapse: number;
    [key: string]: number;
  };
} 