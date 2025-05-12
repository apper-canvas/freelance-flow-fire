import apperService from './apper';

// Expense table name from schema
const TABLE_NAME = 'expense';

// Fetch expenses with optional filters
export const fetchExpenses = async (filters = {}) => {
  const params = {
    Fields: [
      { Field: { Name: "Id" } },
      { Field: { Name: "Name" } },
      { Field: { Name: "Tags" } },
      { Field: { Name: "date" } },
      { Field: { Name: "amount" } },
      { Field: { Name: "category" } },
      { Field: { Name: "description" } },
      { Field: { Name: "billable" } },
      { Field: { Name: "taxRate" } },
      { Field: { Name: "taxAmount" } },
      { Field: { Name: "totalAmount" } },
      { Field: { Name: "projectId" } },
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

  if (filters.projectId) {
    whereConditions.push({
      fieldName: "projectId",
      Operator: "ExactMatch",
      values: [filters.projectId]
    });
  }

  if (filters.category) {
    whereConditions.push({
      fieldName: "category",
      Operator: "ExactMatch",
      values: [filters.category]
    });
  }

  if (filters.billable !== undefined) {
    whereConditions.push({
      fieldName: "billable",
      Operator: "ExactMatch",
      values: [filters.billable]
    });
  }

  if (filters.startDate && filters.endDate) {
    whereConditions.push({
      fieldName: "date",
      Operator: "Between",
      values: [filters.startDate, filters.endDate]
    });
  }

  if (whereConditions.length > 0) {
    params.where = whereConditions;
  }

  // Sort by date descending by default
  params.orderBy = [
    {
      field: "date",
      direction: "desc"
    }
  ];

  try {
    const response = await apperService.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

// Get expense by ID
export const getExpenseById = async (expenseId) => {
  try {
    const response = await apperService.getRecordById(TABLE_NAME, expenseId);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense:", error);
    throw error;
  }
};

// Create an expense
export const createExpense = async (expenseData) => {
  try {
    // Format numbers correctly
    const formattedExpense = {
      ...expenseData,
      amount: parseFloat(expenseData.amount || 0),
      taxRate: parseFloat(expenseData.taxRate || 0),
      taxAmount: parseFloat(expenseData.taxAmount || 0),
      totalAmount: parseFloat(expenseData.totalAmount || 0)
    };

    const params = {
      records: [formattedExpense]
    };

    const response = await apperService.createRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

// Update an expense
export const updateExpense = async (expenseData) => {
  try {
    // Format numbers correctly
    const formattedExpense = {
      ...expenseData,
      amount: parseFloat(expenseData.amount || 0),
      taxRate: parseFloat(expenseData.taxRate || 0),
      taxAmount: parseFloat(expenseData.taxAmount || 0),
      totalAmount: parseFloat(expenseData.totalAmount || 0)
    };

    const params = {
      records: [formattedExpense]
    };

    const response = await apperService.updateRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (expenseId) => {
  try {
    const params = {
      RecordIds: [expenseId]
    };

    const response = await apperService.deleteRecord(TABLE_NAME, params);
    return response.success;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

export default {
  fetchExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};