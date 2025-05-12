import apperService from './apper';

// Document table name from schema
const TABLE_NAME = 'document';

// Fetch documents with optional filters
export const fetchDocuments = async (filters = {}) => {
  const params = {
    Fields: [
      { Field: { Name: "Id" } },
      { Field: { Name: "Name" } },
      { Field: { Name: "Tags" } },
      { Field: { Name: "description" } },
      { Field: { Name: "fileType" } },
      { Field: { Name: "fileName" } },
      { Field: { Name: "size" } },
      { Field: { Name: "access" } },
      { Field: { Name: "encrypted" } },
      { Field: { Name: "folderId" } },
      { Field: { Name: "clientId" } },
      { Field: { Name: "projectId" } }
    ]
  };

  // Add where conditions based on filters
  const whereConditions = [];

  if (filters.clientId) {
    whereConditions.push({
      fieldName: "clientId",
      Operator: "ExactMatch",
      values: [filters.clientId]
    });
  }

  if (filters.projectId) {
    whereConditions.push({
      fieldName: "projectId",
      Operator: "ExactMatch",
      values: [filters.projectId]
    });
  }

  if (filters.folderId) {
    whereConditions.push({
      fieldName: "folderId",
      Operator: "ExactMatch",
      values: [filters.folderId]
    });
  }

  if (filters.access) {
    whereConditions.push({
      fieldName: "access",
      Operator: "ExactMatch",
      values: [filters.access]
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    whereConditions.push({
      fieldName: "Tags",
      Operator: "Contains",
      values: filters.tags
    });
  }

  if (whereConditions.length > 0) {
    params.where = whereConditions;
  }

  try {
    const response = await apperService.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

// Get document by ID
export const getDocumentById = async (documentId) => {
  try {
    const response = await apperService.getRecordById(TABLE_NAME, documentId);
    return response.data;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

// Create a document
export const createDocument = async (documentData) => {
  try {
    // Format size as number if needed
    const formattedDocument = {
      ...documentData,
      size: typeof documentData.size === 'string' ? parseInt(documentData.size) : documentData.size
    };

    // Handle tags if they are passed as a string
    if (typeof formattedDocument.Tags === 'string') {
      try {
        formattedDocument.Tags = JSON.parse(formattedDocument.Tags);
      } catch (e) {
        if (formattedDocument.Tags) {
          formattedDocument.Tags = [formattedDocument.Tags];
        } else {
          formattedDocument.Tags = [];
        }
      }
    }

    const params = {
      records: [formattedDocument]
    };

    const response = await apperService.createRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (documentData) => {
  try {
    // Format size as number if needed
    const formattedDocument = {
      ...documentData,
      size: typeof documentData.size === 'string' ? parseInt(documentData.size) : documentData.size
    };

    // Handle tags if they are passed as a string
    if (typeof formattedDocument.Tags === 'string') {
      try {
        formattedDocument.Tags = JSON.parse(formattedDocument.Tags);
      } catch (e) {
        if (formattedDocument.Tags) {
          formattedDocument.Tags = [formattedDocument.Tags];
        } else {
          formattedDocument.Tags = [];
        }
      }
    }

    const params = {
      records: [formattedDocument]
    };

    const response = await apperService.updateRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (documentId) => {
  try {
    const params = {
      RecordIds: [documentId]
    };

    const response = await apperService.deleteRecord(TABLE_NAME, params);
    return response.success;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export default {
  fetchDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};