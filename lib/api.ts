const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export async function fetchTableData(tableName: string) {
  try {
    const response = await fetch(`${API_URL}/api/tables/${tableName}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details?.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${tableName} data:`, error);
    throw error;
  }
}

export async function updateRecord(tableName: string, id: number, data: any) {
  try {
    const response = await fetch(`${API_URL}/api/tables/${tableName}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details?.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    const updatedData = await response.json();
    return updatedData;
  } catch (error) {
    console.error(`Error updating record in ${tableName}:`, error);
    throw error;
  }
}

export async function deleteRecord(tableName: string, id: number): Promise<void> {
  try {
    console.log(`[API] Attempting to delete record from ${tableName} with ID ${id}`);
    const response = await fetch(`${API_URL}/api/tables/${tableName}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      console.log(`[API] Successfully deleted record from ${tableName}`);
      return;
    }

    if (response.status === 404) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Record not found');
    }

    const errorData = await response.json();
    console.error(`[API] Delete error details:`, errorData);
    throw new Error(errorData.details?.message || errorData.error || 'Failed to delete record');
  } catch (error) {
    console.error(`[API] Error deleting record from ${tableName}:`, error);
    throw error;
  }
}

export async function createRecord(tableName: string, data: any) {
  try {
    const response = await fetch(`${API_URL}/api/tables/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details?.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    const newData = await response.json();
    return newData;
  } catch (error) {
    console.error(`Error creating record in ${tableName}:`, error);
    throw error;
  }
}
