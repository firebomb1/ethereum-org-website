import { FC, Fragment, useEffect, useRef, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableProps,
  TableRow,
} from "@/components/ui/Table"

type DataTableProps<TData, TValue> = TableProps & {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  subComponent?: FC<TData>
  noResultsComponent?: FC
  allDataLength: number
  setMobileFiltersOpen?: (open: boolean) => void
  activeFiltersCount: number
  meta?: Record<string, string | number | boolean>
}

export type TableMeta = {
  setMobileFiltersOpen: (open: boolean) => void
  allDataLength: number
  dataLength: number
  activeFiltersCount: number
  [key: string]: string | number | ((open: boolean) => void)
}

const DataTable = <TData, TValue>({
  columns,
  data,
  subComponent,
  noResultsComponent,
  allDataLength,
  setMobileFiltersOpen,
  activeFiltersCount,
  meta,
  ...props
}: DataTableProps<TData, TValue>) => {
  const [isVisible, setIsVisible] = useState(true)
  const [currentData, setCurrentData] = useState(data)
  const previousDataRef = useRef(data)

  const table = useReactTable({
    data: currentData,
    columns,
    getRowCanExpand: (row) => {
      const rowData = row.original
      return rowData.cantExpand !== undefined ? rowData.cantExpand : true
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    meta: {
      ...meta,
      allDataLength,
      dataLength: data.length,
      setMobileFiltersOpen,
      activeFiltersCount,
    } as TableMeta,
  })

  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      setIsVisible(false)
      const timer = setTimeout(() => {
        setCurrentData(data)
        setIsVisible(true)
        previousDataRef.current = data
      }, 25) // Adjust this value to match your CSS transition duration

      return () => clearTimeout(timer)
    }
  }, [data])

  return (
    <div className="relative">
      <div className="sticky top-[76px] z-10 w-full border-b border-primary bg-background">
        <Table {...props}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Fragment key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Fragment>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>
      <Table {...props}>
        <TableBody
          className={`duration-25 transition-opacity ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, idx) => (
              <Fragment key={row.id}>
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  className={`${row.getIsExpanded() ? "cursor-pointer border-b-background-highlight bg-background-highlight" : "cursor-pointer"} hover:bg-background-highlight`}
                  onClick={(e) => {
                    // Prevent expanding the wallet more info section when clicking on the "Visit website" button
                    if (!(e.target as Element).matches("a, a svg")) {
                      row.getToggleExpandedHandler()()
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Fragment key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Fragment>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow className={`bg-background-highlight`}>
                    <TableCell colSpan={row.getAllCells().length}>
                      {subComponent && subComponent(row.original, idx)}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {noResultsComponent && noResultsComponent({})}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
