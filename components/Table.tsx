import React, { ReactNode } from 'react'

interface TableColumn {
    key: string
    header: string
    align?: 'left' | 'center' | 'right'
    className?: string
}

interface TableProps {
    columns: TableColumn[]
    data: any[]
    loading?: boolean
    emptyIcon?: ReactNode
    emptyMessage?: string
    onRowClick?: (row: any) => void
    renderCell: (column: TableColumn, row: any, rowIndex: number) => ReactNode
    rowClassName?: (row: any, rowIndex: number) => string
}

export default function Table({
    columns,
    data,
    loading = false,
    emptyIcon,
    emptyMessage = 'No data found',
    onRowClick,
    renderCell,
    rowClassName
}: TableProps) {
    return (
        <div className="overflow-x-auto relative">
            {loading && data.length === 0 ? (
                <div className="h-32 flex items-center justify-center w-full">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-xs font-semibold text-gray-900 uppercase tracking-wide ${
                                        column.align === 'center' ? 'text-center' :
                                        column.align === 'right' ? 'text-right' : ''
                                    } ${column.className || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={columns.length} className="py-20 text-center">
                                    {emptyIcon ? (
                                        <div className="inline-flex p-5 bg-slate-50 rounded-full mb-3">
                                            {emptyIcon}
                                        </div>
                                    ) : (
                                        <div className="inline-flex p-5 bg-slate-50 rounded-full mb-3">
                                            <svg className="w-7 h-7 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                    )}
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        {emptyMessage}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    onClick={() => onRowClick?.(row)}
                                    className={`hover:bg-indigo-50/30 transition-colors group/row ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    } ${rowClassName ? rowClassName(row, rowIndex) : ''}`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-4 py-1.5 text-xs ${
                                                column.align === 'center' ? 'text-center' :
                                                column.align === 'right' ? 'text-right' : ''
                                            } ${column.className || ''}`}
                                        >
                                            {renderCell(column, row, rowIndex)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}
