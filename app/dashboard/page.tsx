"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TableSelector } from "@/components/table-selector"
import { TableEditor } from "@/components/table-editor"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
  const [selectedTable, setSelectedTable] = useState("tenders")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    // Increment the refresh key to force a re-render of the TableEditor
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4 flex-grow">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2 text-[#205375] dark:text-[#40a9ff]">SQL Table Update Portal</h1>
          <div className="h-1 w-20 bg-[#205375] dark:bg-[#40a9ff] mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Select a table to view and update its data. Changes will be saved to the database.
          </p>

          <TableSelector 
            selectedTable={selectedTable} 
            onTableChange={setSelectedTable} 
            onRefresh={handleRefresh}
          />
          <TableEditor key={refreshKey} selectedTable={selectedTable} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
