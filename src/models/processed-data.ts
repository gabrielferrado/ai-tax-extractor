import { Tax } from './tax';

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