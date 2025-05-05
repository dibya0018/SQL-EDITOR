"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Upload, X } from "lucide-react"

interface FilePickerProps {
  onFileSelect: (filePath: string, fileName: string) => void
  currentFilePath?: string
  currentFileName?: string
}

export function FilePicker({ onFileSelect, currentFilePath, currentFileName }: FilePickerProps) {
  const [fileName, setFileName] = useState(currentFileName || "")
  const [filePath, setFilePath] = useState(currentFilePath || "")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setError("")
    const folder = "uploads/docs/";
    setFileName(file.name)
    setFilePath(folder)
    onFileSelect(folder, file.name)
  }

  const clearFile = () => {
    setFileName("")
    setFilePath("")
    onFileSelect("", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {filePath ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
          <FileText className="h-5 w-5 text-[#205375]" />
          <span className="flex-1 truncate text-sm">{fileName}</span>
          <Button variant="ghost" size="sm" onClick={clearFile} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="whitespace-nowrap"
          >
            <Upload className="h-4 w-4 mr-2" />
            Select PDF
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
