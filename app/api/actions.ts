"use server"

import { fetchTableData, updateRecord, deleteRecord, createRecord } from "@/lib/api"
import { revalidatePath } from "next/cache"

export async function getTableData(tableName: string) {
  try {
    const data = await fetchTableData(tableName)
    return { success: true, data }
  } catch (error) {
    console.error(`Error fetching ${tableName} data:`, error)
    return { success: false, error: `Failed to fetch ${tableName} data` }
  }
}

export async function updateTableRecord(tableName: string, id: number, data: any) {
  try {
    const updatedRecord = await updateRecord(tableName, id, data)
    revalidatePath("/dashboard")
    return { success: true, data: updatedRecord }
  } catch (error) {
    console.error("Error updating record:", error)
    return { success: false, error: "Failed to update record" }
  }
}

export async function deleteTableRecord(tableName: string, id: number) {
  try {
    await deleteRecord(tableName, id)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting record:", error)
    return { success: false, error: "Failed to delete record" }
  }
}

export async function createTableRecord(tableName: string, data: any) {
  try {
    const newRecord = await createRecord(tableName, data)
    revalidatePath("/dashboard")
    return { success: true, data: newRecord }
  } catch (error) {
    console.error("Error creating record:", error)
    return { success: false, error: "Failed to create record" }
  }
}

// File upload handler
export async function handleFileUpload(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      return { success: false, error: "Only PDF files are allowed" }
    }

    // Create a unique filename to prevent collisions
    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}-${file.name}`
    const uploadPath = `/uploads/${uniqueFilename}`

    // In a real application, you would:
    // 1. Create the uploads directory if it doesn't exist
    // 2. Save the file to the server
    // 3. Store the file path in the database
    // 4. Return the file path and name

    // For now, we'll just return the path and name
    return {
      success: true,
      filePath: uploadPath,
      fileName: file.name,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: "Failed to upload file" }
  }
}
