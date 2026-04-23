'use client'
import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MonthYearFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onFilterChange: (month: number, year: number) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

const MonthYearFilter: React.FC<MonthYearFilterProps> = ({ selectedMonth, selectedYear, onFilterChange }) => {
  return (
    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-r border-gray-100">
        <Calendar className="w-4 h-4 text-blue-600" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter Period</span>
      </div>
      
      <div className="flex gap-2 p-1">
        <select 
          value={selectedMonth}
          onChange={(e) => onFilterChange(parseInt(e.target.value), selectedYear)}
          className="bg-gray-50 border-none text-sm font-bold text-gray-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>

        <select 
          value={selectedYear}
          onChange={(e) => onFilterChange(selectedMonth, parseInt(e.target.value))}
          className="bg-gray-50 border-none text-sm font-bold text-gray-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MonthYearFilter;
