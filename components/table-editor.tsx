"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Save, X, FileText, ExternalLink, ArrowUpDown, Search, Moon, Sun } from "lucide-react"
import { getTableData, updateTableRecord, deleteTableRecord, createTableRecord } from "@/app/api/actions"
import { FilePicker } from "@/components/file-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "@/contexts/theme-context"

interface TableEditorProps {
  selectedTable: string
}

export function TableEditor({ selectedTable }: TableEditorProps) {
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [newFormData, setNewFormData] = useState<any>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [sortField, setSortField] = useState<string>("UpdatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetchData()
  }, [selectedTable])

  useEffect(() => {
    if (data.length > 0) {
      filterData()
    }
  }, [searchQuery, data, sortField, sortOrder])

  const getSortOptions = () => {
    const commonOptions = [
      { value: "UpdatedAt", label: "Last Updated" }
    ]

    const tableSpecificOptions: Record<string, { value: string; label: string }[]> = {
      tenders: [
        { value: "StartDate", label: "Start Date" },
        { value: "EndDate", label: "End Date" },
        { value: "TenderName", label: "Tender Name" }
      ],
      results: [
        { value: "ResultDate", label: "Result Date" },
        { value: "Title", label: "Title" }
      ],
      medical_faculty: [
        { value: "StartDate", label: "Start Date" },
        { value: "EndDate", label: "End Date" },
        { value: "PositionName", label: "Position" }
      ],
      medical_residents: [
        { value: "StartDate", label: "Start Date" },
        { value: "EndDate", label: "End Date" },
        { value: "PositionName", label: "Position" }
      ],
      nonmedical_contractual: [
        { value: "StartDate", label: "Start Date" },
        { value: "EndDate", label: "End Date" },
        { value: "PositionName", label: "Position" }
      ],
      nonmedical_permanent: [
        { value: "StartDate", label: "Start Date" },
        { value: "EndDate", label: "End Date" },
        { value: "PositionName", label: "Position" }
      ]
    }

    return [...commonOptions, ...(tableSpecificOptions[selectedTable] || [])]
  }

  const sortData = (dataToSort: any[]) => {
    return [...dataToSort].sort((a, b) => {
      let valueA = a[sortField]
      let valueB = b[sortField]

      // Handle null/undefined values
      if (valueA === null || valueA === undefined) valueA = ''
      if (valueB === null || valueB === undefined) valueB = ''

      // Handle date fields
      if (sortField.includes('Date') || sortField === 'UpdatedAt') {
        valueA = new Date(valueA).getTime()
        valueB = new Date(valueB).getTime()
      }

      // Handle string fields
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await getTableData(selectedTable)
      if (result.success) {
        setData(result.data || [])
        setFilteredData(sortData(result.data || []))
      } else {
        setError(result.error || "Failed to fetch data")
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("An error occurred while fetching data")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record: any) => {
    setEditingId(record[`${selectedTable}ID`])
    setEditFormData(record)
  }

  const handleFileSelect = (filePath: string, fileName: string) => {
    setEditFormData({
      ...editFormData,
      FilePath: filePath,
      FileName: fileName,
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const result = await updateTableRecord(selectedTable, editingId!, editFormData)

      if (result.success) {
        // Refresh the data after successful update
        const refreshResult = await getTableData(selectedTable)
        if (refreshResult.success) {
          setData(refreshResult.data || [])
        }
        setEditingId(null)
        setEditFormData({})
      } else {
        setError(result.error || "Failed to update record")
      }
    } catch (err) {
      console.error("Error updating record:", err)
      setError("An error occurred while updating the record")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (record: any) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        setLoading(true)
        // Debug log to see the record data
        console.log('Record to delete:', record);
        console.log('Selected table:', selectedTable);
        
        // Get the correct ID field based on the table name
        const idFieldMap: Record<string, string> = {
          'tenders': 'TenderID',
          'results': 'ResultID',
          'medical_faculty': 'FacultyID',
          'medical_residents': 'ResidentID',
          'nonmedical_contractual': 'ContractID',
          'nonmedical_permanent': 'PermanentID'
        };
        
        const idField = idFieldMap[selectedTable];
        console.log('ID Field from map:', idField);
        console.log('Available fields in record:', Object.keys(record));
        
        if (!idField) {
          setError("Invalid table type");
          return;
        }
        
        const id = record[idField];
        console.log('ID value:', id);
        
        if (!id) {
          setError("Invalid record ID");
          return;
        }

        const result = await deleteTableRecord(selectedTable, id)

        if (result.success) {
          // Refresh the data after successful deletion
          const refreshResult = await getTableData(selectedTable)
          if (refreshResult.success) {
            setData(refreshResult.data || [])
          }
        } else {
          setError(result.error || "Failed to delete record")
        }
      } catch (err) {
        console.error("Error deleting record:", err)
        setError("An error occurred while deleting the record")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddNew = () => {
    setShowAddForm(true)
    // Initialize form data based on table type
    const initialData: Record<string, any> = {
      tenders: {
        TenderName: "",
        TenderReferenceNo: "",
        StartDate: "",
        EndDate: "",
        DocumentPath: "",
        CorrigendumPath: ""
      },
      results: {
        Title: "",
        Department: "",
        ReferenceNo: "",
        ResultDate: "",
        DocumentPath: "",
        CorrigendumPath: ""
      },
      medical_faculty: {
        PositionName: "",
        Department: "",
        Venue: "",
        ContactNumber: "",
        ReferenceNo: "",
        StartDate: "",
        EndDate: "",
        DocumentPath: "",
        CorrigendumPath: ""
      },
      medical_residents: {
        PositionName: "",
        Department: "",
        Venue: "",
        ContactNumber: "",
        ReferenceNo: "",
        StartDate: "",
        EndDate: "",
        DocumentPath: "",
        CorrigendumPath: ""
      },
      nonmedical_contractual: {
        PositionName: "",
        Department: "",
        Venue: "",
        ContactNumber: "",
        ReferenceNo: "",
        StartDate: "",
        EndDate: "",
        DocumentPath: "",
        CorrigendumPath: ""
      },
      nonmedical_permanent: {
        PositionName: "",
        Department: "",
        Venue: "",
        ContactNumber: "",
        ReferenceNo: "",
        StartDate: "",
        EndDate: "",
        DocumentPath: "",
        CorrigendumPath: ""
      }
    }
    setNewFormData(initialData[selectedTable] || {})
  }

  const handleNewInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewFormData({ ...newFormData, [name]: value })
  }

  const handleNewFileSelect = (filePath: string, fileName: string) => {
    setNewFormData({
      ...newFormData,
      DocumentPath: filePath,
      FileName: fileName,
    })
  }

  const handleNewCorrigendumSelect = (filePath: string, fileName: string) => {
    setNewFormData({
      ...newFormData,
      CorrigendumPath: filePath,
      CorrigendumFileName: fileName,
    })
  }

  const handleSaveNew = async () => {
    try {
      setLoading(true)
      setError("")

      // Validate required fields and data types
      const formFields = getFormFields()
      const missingFields = formFields
        .filter((field: any) => field.required && !newFormData[field.name])
        .map((field: any) => field.label)

      if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(", ")}`)
        return
      }

      // Format the data based on table type
      const formattedData = { ...newFormData }

      // Format dates to ISO string
      if (formattedData.StartDate) {
        formattedData.StartDate = new Date(formattedData.StartDate).toISOString().split('T')[0]
      }
      if (formattedData.EndDate) {
        formattedData.EndDate = new Date(formattedData.EndDate).toISOString().split('T')[0]
      }
      if (formattedData.ResultDate) {
        formattedData.ResultDate = new Date(formattedData.ResultDate).toISOString().split('T')[0]
      }

      // Remove empty values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === "" || formattedData[key] === null) {
          delete formattedData[key]
        }
      })

      const result = await createTableRecord(selectedTable, formattedData)

      if (result.success) {
        // Refresh the data after successful creation
        const refreshResult = await getTableData(selectedTable)
        if (refreshResult.success) {
          setData(refreshResult.data || [])
        }
        setShowAddForm(false)
        setNewFormData({})
      } else {
        setError(result.error || "Failed to create record")
      }
    } catch (err) {
      console.error("Error creating record:", err)
      setError("An error occurred while creating the record")
    } finally {
      setLoading(false)
    }
  }

  const getTableColumns = () => {
    if (data.length === 0) return []
    const record = data[0]
    const allColumns = Object.keys(record).filter(key => 
      !['CreatedAt', 'UpdatedAt', 'LastLogin'].includes(key)
    )
    
    // If columns are selected, only show those columns
    if (selectedColumns.length > 0) {
      return selectedColumns
    }
    
    return allColumns
  }

  const getColumnOptions = () => {
    if (data.length === 0) return []
    const record = data[0]
    return Object.keys(record)
      .filter(key => !['CreatedAt', 'UpdatedAt', 'LastLogin'].includes(key))
      .map(key => ({
        value: key,
        label: key.replace(/([A-Z])/g, ' $1').trim() // Convert camelCase to spaces
      }))
  }

  const columns = getTableColumns()

  const getFormFields = () => {
    const fields: Record<string, any> = {
      tenders: [
        { name: "TenderName", label: "Tender Name", type: "text", required: true, placeholder: "Enter tender name", maxLength: 255 },
        { name: "TenderReferenceNo", label: "Reference No", type: "text", required: true, placeholder: "Enter reference number", maxLength: 100 },
        { name: "StartDate", label: "Start Date", type: "date", required: true },
        { name: "EndDate", label: "End Date", type: "date", required: true },
        { name: "DocumentPath", label: "Tender Document", type: "file", required: true, maxLength: 255 },
        { name: "CorrigendumPath", label: "Corrigendum Document", type: "file", required: false, maxLength: 255 }
      ],
      results: [
        { name: "Title", label: "Result Title", type: "text", required: true, placeholder: "Enter result title", maxLength: 500 },
        { name: "Department", label: "Department", type: "text", required: true, placeholder: "Enter department name", maxLength: 200 },
        { name: "ReferenceNo", label: "Reference No", type: "text", required: true, placeholder: "Enter reference number", maxLength: 50 },
        { name: "ResultDate", label: "Result Date", type: "date", required: true },
        { name: "DocumentPath", label: "Result Document", type: "file", required: true, maxLength: 500 },
        { name: "CorrigendumPath", label: "Corrigendum Document", type: "file", required: false, maxLength: 500 }
      ],
      medical_faculty: [
        { name: "PositionName", label: "Position Name", type: "text", required: true, placeholder: "Enter position name", maxLength: 500 },
        { name: "Department", label: "Department", type: "text", required: true, placeholder: "Enter department name", maxLength: 200 },
        { name: "Venue", label: "Venue", type: "text", required: true, placeholder: "Enter venue details", maxLength: 500 },
        { name: "ContactNumber", label: "Contact Number", type: "text", required: true, placeholder: "Enter contact number", maxLength: 20 },
        { name: "ReferenceNo", label: "Reference No", type: "text", required: true, placeholder: "Enter reference number", maxLength: 50 },
        { name: "StartDate", label: "Start Date", type: "date", required: true },
        { name: "EndDate", label: "End Date", type: "date", required: true },
        { name: "DocumentPath", label: "Advertisement Document", type: "file", required: true, maxLength: 500 },
        { name: "CorrigendumPath", label: "Corrigendum Document", type: "file", required: false, maxLength: 500 }
      ],
      medical_residents: [
        { name: "PositionName", label: "Position Name", type: "text", required: true, placeholder: "Enter position name", maxLength: 500 },
        { name: "Department", label: "Department", type: "text", required: true, placeholder: "Enter department name", maxLength: 200 },
        { name: "Venue", label: "Venue", type: "text", required: true, placeholder: "Enter venue details", maxLength: 500 },
        { name: "ContactNumber", label: "Contact Number", type: "text", required: true, placeholder: "Enter contact number", maxLength: 20 },
        { name: "ReferenceNo", label: "Reference No", type: "text", required: true, placeholder: "Enter reference number", maxLength: 50 },
        { name: "StartDate", label: "Start Date", type: "date", required: true },
        { name: "EndDate", label: "End Date", type: "date", required: true },
        { name: "DocumentPath", label: "Advertisement Document", type: "file", required: true, maxLength: 500 },
        { name: "CorrigendumPath", label: "Corrigendum Document", type: "file", required: false, maxLength: 500 }
      ],
      nonmedical_contractual: [
        { name: "PositionName", label: "Position Name", type: "text", required: true, placeholder: "Enter position name", maxLength: 500 },
        { name: "Department", label: "Department", type: "text", required: true, placeholder: "Enter department name", maxLength: 200 },
        { name: "Venue", label: "Venue", type: "text", required: true, placeholder: "Enter venue details", maxLength: 500 },
        { name: "ContactNumber", label: "Contact Number", type: "text", required: true, placeholder: "Enter contact number", maxLength: 20 },
        { name: "ReferenceNo", label: "Reference No", type: "text", required: true, placeholder: "Enter reference number", maxLength: 50 },
        { name: "StartDate", label: "Start Date", type: "date", required: true },
        { name: "EndDate", label: "End Date", type: "date", required: true },
        { name: "DocumentPath", label: "Advertisement Document", type: "file", required: true, maxLength: 500 },
        { name: "CorrigendumPath", label: "Corrigendum Document", type: "file", required: false, maxLength: 500 }
      ],
      nonmedical_permanent: [
        { name: "PositionName", label: "Position Name", type: "text", required: true, placeholder: "Enter position name", maxLength: 500 },
        { name: "Department", label: "Department", type: "text", required: true, placeholder: "Enter department name", maxLength: 200 },
        { name: "Venue", label: "Venue", type: "text", required: true, placeholder: "Enter venue details", maxLength: 500 },
        { name: "ContactNumber", label: "Contact Number", type: "text", required: true, placeholder: "Enter contact number", maxLength: 20 },
        { name: "ReferenceNo", label: "Reference No", type: "text", required: true, placeholder: "Enter reference number", maxLength: 50 },
        { name: "StartDate", label: "Start Date", type: "date", required: true },
        { name: "EndDate", label: "End Date", type: "date", required: true },
        { name: "DocumentPath", label: "Advertisement Document", type: "file", required: true, maxLength: 500 },
        { name: "CorrigendumPath", label: "Corrigendum Document", type: "file", required: false, maxLength: 500 }
      ]
    }
    return fields[selectedTable] || []
  }

  const getSearchableFields = () => {
    const commonFields = ['PositionName', 'Department', 'ReferenceNo']
    const tableSpecificFields: Record<string, string[]> = {
      tenders: ['TenderName', 'TenderReferenceNo'],
      results: ['Title'],
      medical_faculty: ['Venue', 'ContactNumber'],
      medical_residents: ['Venue', 'ContactNumber'],
      nonmedical_contractual: ['Venue', 'ContactNumber'],
      nonmedical_permanent: ['Venue', 'ContactNumber']
    }
    return [...commonFields, ...(tableSpecificFields[selectedTable] || [])]
  }

  const filterData = () => {
    if (!searchQuery.trim()) {
      setFilteredData(sortData(data))
      return
    }

    const searchableFields = getSearchableFields()
    const query = searchQuery.toLowerCase()

    const filtered = data.filter(item => {
      return searchableFields.some(field => {
        const value = item[field]
        if (value === null || value === undefined) return false
        return value.toString().toLowerCase().includes(query)
      })
    })

    setFilteredData(sortData(filtered))
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Table Editor</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={toggleTheme}
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-4">
        {error && (
          <div className={`p-3 ${theme === "dark" ? 'bg-red-900/50 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'} border rounded-md text-sm`}>
            {error}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme === "dark" ? 'text-gray-400' : 'text-gray-500'}`} />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 w-full ${theme === "dark" ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'} focus:border-[#205375] focus:ring-[#205375]`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={sortField}
                onValueChange={(value) => {
                  setSortField(value)
                }}
              >
                <SelectTrigger className={`w-[180px] ${theme === "dark" ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {getSortOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }}
                className={`flex items-center gap-2 ${theme === "dark" ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} hover:text-[#205375] hover:border-[#205375]`}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUpDown className="h-4 w-4 rotate-180" />
                ) : (
                  <ArrowUpDown className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedColumns.length > 0 ? selectedColumns.join(',') : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedColumns([])
                } else {
                  setSelectedColumns(value.split(','))
                }
              }}
            >
              <SelectTrigger className={`w-[180px] ${theme === "dark" ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
                <SelectValue placeholder="Show columns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Columns</SelectItem>
                {getColumnOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleAddNew} 
              className="w-full sm:w-auto bg-[#205375] hover:bg-[#112B3C] text-white"
            >
              Add New
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="p-6 border rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add New Record</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewFormData({})
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveNew(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFormFields().map((field: any) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === "file" ? (
                      field.name === "DocumentPath" ? (
                        <div className="space-y-2">
                          <FilePicker
                            onFileSelect={handleNewFileSelect}
                            currentFilePath={newFormData.DocumentPath}
                            currentFileName={newFormData.FileName}
                          />
                          {newFormData.DocumentPath && (
                            <div className="text-xs text-gray-500">
                              Selected: {newFormData.FileName || newFormData.DocumentPath.split('/').pop()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FilePicker
                            onFileSelect={handleNewCorrigendumSelect}
                            currentFilePath={newFormData.CorrigendumPath}
                            currentFileName={newFormData.CorrigendumFileName}
                          />
                          {newFormData.CorrigendumPath && (
                            <div className="text-xs text-gray-500">
                              Selected: {newFormData.CorrigendumFileName || newFormData.CorrigendumPath.split('/').pop()}
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <Input
                        type={field.type}
                        name={field.name}
                        value={newFormData[field.name] || ""}
                        onChange={handleNewInputChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewFormData({})
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#205375] hover:bg-[#112B3C]"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Record"}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className={`overflow-x-auto border rounded-md ${theme === "dark" ? 'border-gray-700' : 'border-gray-200'}`}>
          {loading ? (
            <div className="text-center py-10">Loading data...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-10">No data available</div>
          ) : (
            <Table>
              <TableHeader className={theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-900"}>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={`header-${column}`}
                      className={theme === "dark" ? "font-bold text-gray-100" : "font-bold text-gray-900"}
                    >
                      {column.replace(/([A-Z])/g, ' $1').trim()}
                    </TableHead>
                  ))}
                  <TableHead className={theme === "dark" ? "font-bold text-gray-100" : "font-bold text-gray-900"}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record, index) => {
                  const rowId = record[`${selectedTable}ID`] || `index-${index}`;
                  return (
                    <TableRow key={`row-${rowId}`} className={theme === "dark" ? "hover:bg-gray-700 bg-gray-900 text-gray-100" : "hover:bg-gray-50 bg-white text-gray-900"}>
                      {columns.map((column) => (
                        <TableCell
                          key={`cell-${rowId}-${column}`}
                          className={theme === "dark" ? "text-gray-100" : "text-gray-900"}
                        >
                          {editingId === record[`${selectedTable}ID`] ? (
                            column === "FilePath" ? (
                              <FilePicker
                                key={`picker-${rowId}-${column}`}
                                onFileSelect={handleFileSelect}
                                currentFilePath={editFormData.FilePath}
                                currentFileName={editFormData.FileName}
                              />
                            ) : column === "DocumentPath" || column === "CorrigendumPath" ? (
                              <div key={`file-container-${rowId}-${column}`} className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-[#205375]" />
                                <span className="truncate max-w-[200px]">{record[column]?.split('/').pop() || "-"}</span>
                                {record[column] && (
                                  <a
                                    key={`file-link-${rowId}-${column}`}
                                    href={record[column]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#205375] hover:text-[#112B3C]"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            ) : column.includes("Date") ? (
                              <Input
                                key={`date-input-${rowId}-${column}`}
                                type="date"
                                name={column}
                                value={editFormData[column]?.split('T')[0] || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, [column]: e.target.value })}
                                disabled={loading}
                              />
                            ) : (
                              <Input
                                key={`text-input-${rowId}-${column}`}
                                name={column}
                                value={editFormData[column] || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, [column]: e.target.value })}
                                disabled={loading}
                              />
                            )
                          ) : column === "FilePath" && record[column] ? (
                            <div key={`file-view-${rowId}-${column}`} className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#205375]" />
                              <span className="truncate max-w-[200px]">{record[column]}</span>
                              <a
                                key={`file-link-${rowId}-${column}`}
                                href={record[column]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#205375] hover:text-[#112B3C]"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          ) : column.includes("Date") ? (
                            <span key={`date-display-${rowId}-${column}`}>
                              {record[column] ? new Date(record[column]).toLocaleDateString() : "-"}
                            </span>
                          ) : (
                            <span key={`text-display-${rowId}-${column}`}>
                              {record[column] || "-"}
                            </span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
                        <Button
                          key={`delete-${rowId}`}
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(record)}
                          className="text-red-600 hover:text-white bg-white hover:bg-red-600 border-red-600 hover:border-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
