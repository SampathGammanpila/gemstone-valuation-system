import React, { ReactNode } from 'react';

export interface SummaryTableColumn {
  id: string;
  header: string;
  accessor: (item: any) => ReactNode;
  className?: string;
}

export interface SummaryTableProps {
  title?: string;
  description?: string;
  columns: SummaryTableColumn[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  emptyMessage?: string;
  className?: string;
  highlightedRows?: number[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({
  title,
  description,
  columns,
  data,
  onEdit,
  onDelete,
  emptyMessage = 'No data available',
  className = '',
  highlightedRows = [],
}) => {
  return (
    <div className={`bg-white shadow overflow-hidden rounded-lg ${className}`}>
      {(title || description) && (
        <div className="px-4 py-5 sm:px-6">
          {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
          {description && <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>}
        </div>
      )}
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                
                {(onEdit || onDelete) && (
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={highlightedRows.includes(rowIndex) ? 'bg-yellow-50' : ''}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${rowIndex}-${column.id}`}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.className || ''}`}
                      >
                        {column.accessor(item)}
                      </td>
                    ))}
                    
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Edit
                            </button>
                          )}
                          
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummaryTable;