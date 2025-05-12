import apperService from './apper';

// Client table name from schema
const TABLE_NAME = 'client';

// Fetch all clients
export const fetchClients = async (filters = {}) => {
  const params = {
    Fields: [
      { Field: { Name: "Id" } },
      { Field: { Name: "Name" } },
      { Field: { Name: "Tags" } },
      { Field: { Name: "contactInfo" } },
      { Field: { Name: "status" } },
      { Field: { Name: "communicationLog" } }
    ]
  };

  // Add filters if provided
  if (filters.status) {
    params.where = [
      {
        fieldName: "status",
        Operator: "ExactMatch",
        values: [filters.status]
      }
    ];
  }

  try {
    const response = await apperService.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

// Get client by ID
export const getClientById = async (clientId) => {
  try {
    const response = await apperService.getRecordById(TABLE_NAME, clientId);
    return response.data;
  } catch (error) {
    console.error("Error fetching client:", error);
    throw error;
  }
};

// Create a client
export const createClient = async (clientData) => {
  try {
    // Parse contact info if it's a string
    if (typeof clientData.contactInfo === 'string') {
      try {
        clientData.contactInfo = JSON.parse(clientData.contactInfo);
      } catch (e) {
        // If parsing fails, leave as is
      }
    }

    // Parse communication log if it's a string
    if (typeof clientData.communicationLog === 'string') {
      try {
        clientData.communicationLog = JSON.parse(clientData.communicationLog);
      } catch (e) {
        clientData.communicationLog = [];
      }
    }

    const params = {
      records: [clientData]
    };

    const response = await apperService.createRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

// Update a client
export const updateClient = async (clientData) => {
  try {
    // Parse contact info if it's a string
    if (typeof clientData.contactInfo === 'string') {
      try {
        clientData.contactInfo = JSON.parse(clientData.contactInfo);
      } catch (e) {
        // If parsing fails, leave as is
      }
    }

    // Parse communication log if it's a string
    if (typeof clientData.communicationLog === 'string') {
      try {
        clientData.communicationLog = JSON.parse(clientData.communicationLog);
      } catch (e) {
        // If parsing fails, leave as is
      }
    }

    const params = {
      records: [clientData]
    };

    const response = await apperService.updateRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};

// Delete a client
export const deleteClient = async (clientId) => {
  try {
    const params = {
      RecordIds: [clientId]
    };

    const response = await apperService.deleteRecord(TABLE_NAME, params);
    return response.success;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};

export default {
  fetchClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};