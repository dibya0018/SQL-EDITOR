"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { FileText } from "lucide-react"

interface FilePickerProps {
  onFileSelect: (filePath: string, fileName: string) => void
  currentFilePath?: string
  currentFileName?: string
  directory?: string
}

export function FilePicker({ onFileSelect, currentFilePath, currentFileName, directory }: FilePickerProps) {
  const [inputValue, setInputValue] = useState(currentFilePath || "")
  const [error, setError] = useState("")

  const handleBlur = () => {
    if (inputValue.trim() === "") {
      onFileSelect("", "")
      return
    }
    // Assume the input is a full file path (e.g. E:/mpmmcc.tmc.gov.in/mpmmcc/public/Tend/example.pdf)
    const folder = directory || "uploads/docs/"
    const fileName = inputValue.split(/[\\/]/).pop() || ""
    onFileSelect(folder, fileName)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">File Path (PDF)</label>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Enter (or paste) your PDF file path (e.g. /Results/example.pdf)"
        className="w-full"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
