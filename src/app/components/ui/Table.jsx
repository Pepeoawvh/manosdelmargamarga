'use client'
import { useState } from 'react';

const Table = ({
  columns,
  data,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No hay datos disponibles',
  sortable = false,
  pagination = false,
  itemsPerPage = 10,
  rowClassName,
  containerClassName,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Manejar ordenamiento
  const requestSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Aplicar ordenamiento si es necesario
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    // Manejar valores nulos o indefinidos
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Ordenar diferentes tipos de datos
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      return sortConfig.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    }
  });

  // Calcular paginación
  const totalPages = pagination ? Math.ceil(sortedData.length / itemsPerPage) : 1;
  
  // Obtener datos de la página actual
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  // Renderizar tabla vacía durante carga
  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded shadow-sm ${containerClassName}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.key}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Renderizar mensaje si no hay datos
  if (!data.length) {
    return (
      <div className={`bg-white border border-gray-200 rounded shadow-sm p-4 text-center text-gray-500 ${containerClassName}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded shadow-sm ${containerClassName}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`
                    px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}
                  `}
                  onClick={() => sortable && column.sortable !== false && requestSort(column.key)}
                >
                  <div className="flex items-center">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <span className="ml-1">
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '⇅'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  ${typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || ''}
                `}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 whitespace-nowrap">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      {pagination && totalPages > 1 && (
        <div className="border-t p-2 flex justify-between items-center bg-gray-50 text-sm">
          <div className="text-gray-500">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, data.length)} de {data.length}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-2 py-1 rounded ${
                  currentPage === index + 1 
                    ? 'bg-emerald-100 text-emerald-700 font-medium' 
                    : 'hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;