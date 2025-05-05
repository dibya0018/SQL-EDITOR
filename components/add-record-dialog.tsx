"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FilePicker } from "@/components/file-picker"
import { createTableRecord } from "@/app/api/actions"

interface AddRecordDialogProps {
  tableName: string
  onRecordAdded: () => void
}

export function AddRecordDialog({ tableName, onRecordAdded }: AddRecordDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Department: "",
    StartDate: "",
    EndDate: "",
    Status: "Active",
    FilePath: "",
    FileName: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileSelect = (filePath: string, fileName: string) => {
    setFormData({
      ...formData,
      FilePath: filePath,
      FileName: fileName,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const result = await createTableRecord(tableName, formData)

      if (result.success) {
        // Close dialog and refresh data
        setOpen(false)
        onRecordAdded()

        // Reset form
        setFormData({
          Title: "",
          Description: "",
          Department: "",
          StartDate: "",
          EndDate: "",
          Status: "Active",
          FilePath: "",
          FileName: "",
        })
      } else {
        setError(result.error || "Failed to create record")
      }
    } catch (err) {
      console.error("Error creating record:", err)
      setError("An error occurred while creating the record")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#205375] hover:bg-[#112B3C] text-white">Add New Record</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Record</DialogTitle>
            <DialogDescription>Create a new record in the {tableName} table.</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm mt-4">{error}</div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Title" className="text-right">
                Title
              </Label>
              <Input
                id="Title"
                name="Title"
                value={formData.Title}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Description" className="text-right">
                Description
              </Label>
              <Input
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Department" className="text-right">
                Department
              </Label>
              <Input
                id="Department"
                name="Department"
                value={formData.Department}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="StartDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="StartDate"
                name="StartDate"
                type="date"
                value={formData.StartDate}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="EndDate" className="text-right">
                End Date
              </Label>
              <Input
                id="EndDate"
                name="EndDate"
                type="date"
                value={formData.EndDate}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Status" className="text-right">
                Status
              </Label>
              <Input
                id="Status"
                name="Status"
                value={formData.Status}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="FilePath" className="text-right">
                PDF File
              </Label>
              <div className="col-span-3">
                <FilePicker
                  onFileSelect={handleFileSelect}
                  currentFilePath={formData.FilePath}
                  currentFileName={formData.FileName}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-[#205375] hover:bg-[#112B3C]" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
