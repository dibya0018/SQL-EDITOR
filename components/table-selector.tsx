"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddRecordDialog } from "@/components/add-record-dialog"
import { useRouter } from "next/navigation"
import { TableEditor } from "@/components/table-editor"

interface TableSelectorProps {
  selectedTable: string
  onTableChange: (value: string) => void
  onRefresh: () => void
}

export function TableSelector({ selectedTable, onTableChange, onRefresh }: TableSelectorProps) {
  const router = useRouter()

  const handleTableChange = (value: string) => {
    onTableChange(value)
    // Trigger a refresh of the table data
    onRefresh()
  }

  const handleRefresh = () => {
    // Call the parent's refresh function
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedTable}
            onValueChange={handleTableChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tenders">Tenders</SelectItem>
              <SelectItem value="results">Results</SelectItem>
              <SelectItem value="medical_faculty">Medical Faculty</SelectItem>
              <SelectItem value="medical_residents">Medical Residents</SelectItem>
              <SelectItem value="nonmedical_contractual">Non-Medical Contractual</SelectItem>
              <SelectItem value="nonmedical_permanent">Non-Medical Permanent</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} className="bg-[#205375] hover:bg-[#112B3C]">
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  )
}
