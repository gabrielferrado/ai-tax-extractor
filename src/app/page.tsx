'use client';

import { Tax } from '@/models/tax';
import { processTaxData } from '@/services/tax.service';
import { logger } from '@/utils/logger.utils';
import { useState, FormEvent, useRef } from 'react';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ReturnType<typeof processTaxData> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTable, setCopiedTable] = useState<string | null>(null);
  const tableRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      // Reset state when a new file is selected
      setProcessedData(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo PDF para processar.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedData(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro durante o processamento.');
      }

      // Parse the response and process the data
      const parsedTransactions = JSON.parse(data.summary);
      const processed = processTaxData(parsedTransactions);
      setProcessedData(processed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (tableId: string) => {
    const tableElement = tableRefs.current[tableId];
    if (!tableElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir ${tableId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            table { 
              width: 100%;
              border-collapse: collapse;
            }
            th, td { 
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th { 
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .total-row { 
              font-weight: bold;
              background-color: #f8f8f8;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print { 
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${tableElement.querySelector('table')?.outerHTML}
          <div class="no-print">
            <button onclick="window.print()">Imprimir</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopy = async (tableId: string) => {
    const tableElement = tableRefs.current[tableId];
    if (!tableElement) return;

    try {
      await navigator.clipboard.writeText(tableElement.innerText);
      setCopiedTable(tableId);
      setTimeout(() => setCopiedTable(null), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const renderTaxTable = (title: string, transactions: Tax[], total: number) => {
    const tableId = `table-${title.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <div key={tableId} className="mt-8" ref={(el: HTMLDivElement | null) => {
        tableRefs.current[tableId] = el;
      }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(tableId)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copiedTable === tableId ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={() => handlePrint(tableId)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <tr key={`${transaction.date}-${transaction.doc}-${transaction.name}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{transaction.name}</div>
                    {transaction.subtitle && (
                      <div className="text-sm text-gray-500">{transaction.subtitle}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                    {transaction.value}
                  </td>
                </tr>
              ))}
              <tr key={`total-${tableId}`} className="bg-gray-50 font-medium">
                <td colSpan={2} className="px-6 py-4 text-right text-sm text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                  R$ {total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Extrato Bancário
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Faça upload de um extrato em PDF para extrair as transações.
        </p>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload do PDF
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={!file || isLoading}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md
                hover:bg-blue-700 focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-blue-500
                disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processando...' : 'Processar Extrato'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md">
              <p>
                <strong>Erro:</strong> {error}
              </p>
            </div>
          )}

          {processedData && (
            <div className="mt-6">
              {/* Render collapsed taxes table first */}
              {processedData.tables.collapse.length > 0 && (
                renderTaxTable('Taxas e Tarifas', processedData.tables.collapse, processedData.totals.collapse)
              )}

              {/* Render other tax tables */}
              {Object.entries(processedData.tables)
                .filter(([key]) => key !== 'collapse')
                .map(([taxName, transactions]) => (
                  renderTaxTable(taxName, transactions, processedData.totals[taxName])
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}