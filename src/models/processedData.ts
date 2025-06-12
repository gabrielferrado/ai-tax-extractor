import { Tax } from './tax';
import { TaxTable } from './taxTable';
import { TaxTotals } from './taxTotals';

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