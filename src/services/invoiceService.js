import apperService from './apper';

// Invoice table name from schema
const TABLE_NAME = 'invoice';

// Fetch invoices with optional filters
export const fetchInvoices = async (filters = {}) => {
  const params = {
    Fields: [
      { Field: { Name: "Id" } },
      { Field: { Name: "Name" } },
      { Field: { Name: "Tags" } },
      { Field: { Name: "projectIds" } },
      { Field: { Name: "status" } },
      { Field: { Name: "issueDate" } },
      { Field: { Name: "dueDate" } },
      { Field: { Name: "amount" } },
      { Field: { Name: "notes" } },
      { Field: { Name: "template" } },
      { Field: { Name: "clientId" } }
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

  if (filters.status) {
    whereConditions.push({
      fieldName: "status",
      Operator: "ExactMatch",
      values: [filters.status]
    });
  }

  if (filters.startDate && filters.endDate) {
    whereConditions.push({
      fieldName: "issueDate",
      Operator: "Between",
      values: [filters.startDate, filters.endDate]
    });
  }

  if (whereConditions.length > 0) {
    params.where = whereConditions;
  }

  // Sort by issue date descending by default
  params.orderBy = [
    {
      field: "issueDate",
      direction: "desc"
    }
  ];

  try {
    const response = await apperService.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

// Get invoice by ID
export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await apperService.getRecordById(TABLE_NAME, invoiceId);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
};

// Create an invoice
export const createInvoice = async (invoiceData) => {
  try {
    // Format projectIds if necessary
    let formattedInvoice = {
      ...invoiceData,
      amount: parseFloat(invoiceData.amount || 0)
    };

    // Handle projectIds: ensure it's an array even if passed as a string
    if (typeof formattedInvoice.projectIds === 'string') {
      try {
        formattedInvoice.projectIds = JSON.parse(formattedInvoice.projectIds);
      } catch (e) {
        if (formattedInvoice.projectIds) {
          formattedInvoice.projectIds = [formattedInvoice.projectIds];
        } else {
          formattedInvoice.projectIds = [];
        }
      }
    }

    const params = {
      records: [formattedInvoice]
    };

    const response = await apperService.createRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

// Update an invoice
export const updateInvoice = async (invoiceData) => {
  try {
    // Format projectIds if necessary
    let formattedInvoice = {
      ...invoiceData,
      amount: parseFloat(invoiceData.amount || 0)
    };

    // Handle projectIds: ensure it's an array even if passed as a string
    if (typeof formattedInvoice.projectIds === 'string') {
      try {
        formattedInvoice.projectIds = JSON.parse(formattedInvoice.projectIds);
      } catch (e) {
        if (formattedInvoice.projectIds) {
          formattedInvoice.projectIds = [formattedInvoice.projectIds];
        } else {
          formattedInvoice.projectIds = [];
        }
      }
    }

    const params = {
      records: [formattedInvoice]
    };

    const response = await apperService.updateRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

// Delete an invoice
export const deleteInvoice = async (invoiceId) => {
  try {
    const params = {
      RecordIds: [invoiceId]
    };

    const response = await apperService.deleteRecord(TABLE_NAME, params);
    return response.success;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

export default {
  fetchInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};