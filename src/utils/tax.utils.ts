import { Tax } from '@/models/tax';
import { standardize } from '@/utils';

/**
 * Checks if a tax name or subtitle is included in a list of tax names
 * @param tax The tax object to check
 * @param taxList The list of tax names to check against
 * @returns boolean indicating if the tax is included in the list
 */
export const isTaxIncluded = (tax: Tax, taxList: string[]): boolean => {
  return taxList.some(taxName => 
    standardize(tax.name).includes(standardize(taxName)) ||
    (tax.subtitle && standardize(tax.subtitle).includes(standardize(taxName)))
  );
};

/**
 * Finds a matching tax name from a list of tax names
 * @param tax The tax object to check
 * @param taxList The list of tax names to check against
 * @returns The matching tax name or undefined if no match is found
 */
export const findMatchingTax = (tax: Tax, taxList: string[]): string | undefined => {
  return taxList.find(taxName => 
    standardize(tax.name).includes(standardize(taxName)) ||
    (tax.subtitle && standardize(tax.subtitle).includes(standardize(taxName)))
  );
}; 