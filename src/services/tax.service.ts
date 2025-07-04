import { COLLAPSED_TAXES, TAXES } from '@/constants';
import { Tax } from '@/models/tax';
import { ProcessedData } from '@/models/processed-data';
import { isTaxIncluded, findMatchingTax } from '@/utils/tax.utils';
import { logger } from '@/utils/logger.utils';

const formatDate = (date: string): string => {
  const [day, month, year] = date.split('/');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

const convertToNumber = (value: string): number => {
  return Math.abs(parseFloat(value.replace(',', '.')));
};

export const processTaxData = (data: Tax[]): ProcessedData => {
  logger.debug('Processing tax data:', { totalTransactions: data.length });
  
  const result: ProcessedData = {
    tables: { collapse: [] },
    totals: { collapse: 0 },
  };

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  logger.debug('Sorted data by date:', sortedData.map(t => ({ date: t.date, name: t.name })));

  for (const tax of sortedData) {
    const { date, name, subtitle, doc, value } = tax;
    logger.info('Processing tax:', { date, name, subtitle, doc, value });

    const formattedTax: Tax = {
      date: formatDate(date),
      name,
      subtitle,
      doc,
      value,
    };

    if (isTaxIncluded(formattedTax, COLLAPSED_TAXES)) {
      logger.debug('Tax is collapsed:', { name, subtitle });
      result.tables.collapse.push(formattedTax);
      result.totals.collapse += convertToNumber(value);
      continue;
    }

    const matchingTax = findMatchingTax(formattedTax, TAXES);

    if (matchingTax) {
      logger.info('Tax matched:', { name, subtitle, matchingTax });
      
      if (!result.tables[matchingTax]) {
        result.tables[matchingTax] = [];
        result.totals[matchingTax] = 0;
      }

      result.tables[matchingTax].push(formattedTax);
      result.totals[matchingTax] += convertToNumber(value);
    } else {
      logger.warn('Tax not matched:', { name, subtitle });
    }
  }

  logger.info('Processing complete:', {
    totalCollapsed: result.tables.collapse.length,
    totalCategories: Object.keys(result.tables).length - 1,
    totals: result.totals,
    result,
  });

  return result;
}; 