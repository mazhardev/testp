import { useState } from 'react';
import { Search } from 'lucide-react';

interface ETFSelectorProps {
  onSelect: (symbol: string) => void;
  selectedETF: string;
  etfs: any[];
}

export default function ETFSelector({ onSelect, selectedETF, etfs }: ETFSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredETFs = etfs.filter(etf => 
    etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etf.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-md"
          placeholder="Search ETFs by name, symbol, or sector..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
<div className="overflow-x-auto rounded-lg shadow-md">
  <table className="table-auto w-full">
    <thead className="bg-gray-50">
      <tr>
        <th className="w-1/6 px-3 py-3 text-xs font-medium text-left text-gray-600">SYMBOL</th>
        <th className="w-2/6 px-3 py-3 text-xs font-medium text-left text-gray-600">NAME</th>
        <th className="w-1/6 hidden md:table-cell px-3 py-3 text-xs font-medium text-left text-gray-600">
          EXPENSE RATIO
        </th>
        <th className="w-1/6 hidden lg:table-cell px-3 py-3 text-xs font-medium text-left text-gray-600">
          1Y RETURN
        </th>
        <th className="w-1/6 px-3 py-3 text-xs font-medium text-left text-gray-600"></th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {filteredETFs.map((etf) => (
        <tr key={etf.symbol} className="transition-colors hover:bg-gray-50">
          <td className="px-3 py-3 text-sm font-medium text-gray-900 break-words">
            {etf.symbol}
          </td>
          <td className="px-3 py-3 text-sm text-gray-500 break-words">
            {etf.name}
          </td>
          <td className="px-3 py-3 text-sm text-gray-500 break-words hidden md:table-cell">
            {etf.expenseRatio}%
          </td>
          <td className="px-3 py-3 text-sm text-gray-500 break-words hidden lg:table-cell">
            {etf.oneYearReturn}%
          </td>
          <td className="px-3 py-3 text-sm">
            <button
              onClick={() => onSelect(etf.symbol)}
              className={`px-3 py-1.5 rounded-md ${
                selectedETF === etf.symbol
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-500'
              }`}
            >
              {selectedETF === etf.symbol ? 'Selected' : 'Select'}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}