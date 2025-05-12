import { createSlice } from '@reduxjs/toolkit';

// Define the initial state with the tables from the provided schema
const initialState = {
  tables: [
    {
      id: 5423,
      name: "client",
      label: "Client",
      plural: "Clients",
      icon: "users",
      fields: [
        { name: "Id", label: "Id", type: "Number", id: 97909 },
        { name: "Name", label: "name", type: "Text", id: 97910 },
        { name: "Tags", label: "Tags", type: "Tag", id: 97911 },
        { name: "Owner", label: "Owner", type: "Lookup", id: 97912, displayFieldsOfToTable: "Name" },
        { name: "CreatedOn", label: "Created On", type: "DateTime", id: 97913 },
        { name: "CreatedBy", label: "Created By", type: "Lookup", id: 97914, displayFieldsOfToTable: "Name" },
        { name: "ModifiedOn", label: "Modified On", type: "DateTime", id: 97915 },
        { name: "ModifiedBy", label: "Modified By", type: "Lookup", id: 97916, displayFieldsOfToTable: "Name" },
        { name: "DeletedOn", label: "Deleted On", type: "DateTime", id: 97917 },
        { name: "DeletedBy", label: "Deleted By", type: "Lookup", id: 97918, displayFieldsOfToTable: "Name" },
        { name: "IsDeleted", label: "Is Deleted", type: "Boolean", id: 97919 },
        { name: "InSandbox", label: "In Sandbox", type: "Boolean", id: 97920 },
        { name: "contactInfo", label: "contactInfo", type: "MultilineText", id: 97921 },
        { name: "status", label: "status", type: "Picklist", id: 97922, picklistValues: "active,inactive" },
        { name: "communicationLog", label: "communicationLog", type: "MultilineText", id: 97923 }
      ]
    },
    {
      id: 5424,
      name: "project",
      label: "Project",
      plural: "Projects",
      icon: "folder",
      fields: [
        { name: "Id", label: "Id", type: "Number", id: 97924 },
        { name: "Name", label: "name", type: "Text", id: 97925 },
        { name: "Tags", label: "Tags", type: "Tag", id: 97926 },
        { name: "Owner", label: "Owner", type: "Lookup", id: 97927, displayFieldsOfToTable: "Name" },
        { name: "CreatedOn", label: "Created On", type: "DateTime", id: 97928 },
        { name: "CreatedBy", label: "Created By", type: "Lookup", id: 97929, displayFieldsOfToTable: "Name" },
        { name: "ModifiedOn", label: "Modified On", type: "DateTime", id: 97930 },
        { name: "ModifiedBy", label: "Modified By", type: "Lookup", id: 97931, displayFieldsOfToTable: "Name" },
        { name: "DeletedOn", label: "Deleted On", type: "DateTime", id: 97932 },
        { name: "DeletedBy", label: "Deleted By", type: "Lookup", id: 97933, displayFieldsOfToTable: "Name" },
        { name: "IsDeleted", label: "Is Deleted", type: "Boolean", id: 97934 },
        { name: "InSandbox", label: "In Sandbox", type: "Boolean", id: 97935 },
        { name: "status", label: "status", type: "Picklist", id: 97937, picklistValues: "active,on_hold,completed" },
        { name: "hourlyRate", label: "hourlyRate", type: "Currency", id: 97938 },
        { name: "budgetAmount", label: "budgetAmount", type: "Currency", id: 97939 },
        { name: "budgetType", label: "budgetType", type: "Picklist", id: 97940, picklistValues: "fixed,hourly" },
        { name: "description", label: "description", type: "MultilineText", id: 97941 },
        { name: "clientId", label: "clientId", type: "Lookup", id: 97936, toTable: "client", displayFieldsOfToTable: "Name" }
      ]
    },
    {
      id: 5425,
      name: "milestone",
      label: "Milestone",
      plural: "Milestones",
      icon: "flag",
      fields: [
        { name: "Id", label: "Id", type: "Number", id: 97942 },
        { name: "Name", label: "Name", type: "Text", id: 97943 },
        { name: "Tags", label: "Tags", type: "Tag", id: 97944 },
        { name: "Owner", label: "Owner", type: "Lookup", id: 97945, displayFieldsOfToTable: "Name" },
        { name: "CreatedOn", label: "Created On", type: "DateTime", id: 97946 },
        { name: "CreatedBy", label: "Created By", type: "Lookup", id: 97947, displayFieldsOfToTable: "Name" },
        { name: "ModifiedOn", label: "Modified On", type: "DateTime", id: 97948 },
        { name: "ModifiedBy", label: "Modified By", type: "Lookup", id: 97949, displayFieldsOfToTable: "Name" },
        { name: "DeletedOn", label: "Deleted On", type: "DateTime", id: 97950 },
        { name: "DeletedBy", label: "Deleted By", type: "Lookup", id: 97951, displayFieldsOfToTable: "Name" },
        { name: "IsDeleted", label: "Is Deleted", type: "Boolean", id: 97952 },
        { name: "InSandbox", label: "In Sandbox", type: "Boolean", id: 97953 },
        { name: "title", label: "title", type: "Text", id: 97954 },
        { name: "description", label: "description", type: "MultilineText", id: 97955 },
        { name: "dueDate", label: "dueDate", type: "Date", id: 97956 },
        { name: "amount", label: "amount", type: "Currency", id: 97957 },
        { name: "status", label: "status", type: "Picklist", id: 97958, picklistValues: "completed,in_progress,pending" },
        { name: "projectId", label: "projectId", type: "Lookup", id: 97959, toTable: "client", displayFieldsOfToTable: "Name" }
      ]
    },
    {
      id: 5426,
      name: "time_entry",
      label: "Time Entry",
      plural: "Time Entries",
      icon: "clock",
      fields: [
        { name: "Id", label: "Id", type: "Number", id: 97960 },
        { name: "Name", label: "Name", type: "Text", id: 97961 },
        { name: "Tags", label: "Tags", type: "Tag", id: 97962 },
        { name: "Owner", label: "Owner", type: "Lookup", id: 97963, displayFieldsOfToTable: "Name" },
        { name: "CreatedOn", label: "Created On", type: "DateTime", id: 97964 },
        { name: "CreatedBy", label: "Created By", type: "Lookup", id: 97965, displayFieldsOfToTable: "Name" },
        { name: "ModifiedOn", label: "Modified On", type: "DateTime", id: 97966 },
        { name: "ModifiedBy", label: "Modified By", type: "Lookup", id: 97967, displayFieldsOfToTable: "Name" },
        { name: "DeletedOn", label: "Deleted On", type: "DateTime", id: 97968 },
        { name: "DeletedBy", label: "Deleted By", type: "Lookup", id: 97969, displayFieldsOfToTable: "Name" },
        { name: "IsDeleted", label: "Is Deleted", type: "Boolean", id: 97970 },
        { name: "InSandbox", label: "In Sandbox", type: "Boolean", id: 97971 },
        { name: "startTime", label: "startTime", type: "DateTime", id: 97974 },
        { name: "endTime", label: "endTime", type: "DateTime", id: 97975 },
        { name: "duration", label: "duration", type: "Decimal", id: 97976 },
        { name: "description", label: "description", type: "Text", id: 97977 },
        { name: "hourlyRate", label: "hourlyRate", type: "Currency", id: 97978 },
        { name: "billable", label: "billable", type: "Boolean", id: 97979 },
        { name: "projectId", label: "projectId", type: "Lookup", id: 97972, toTable: "client", displayFieldsOfToTable: "Name" },
        { name: "clientId", label: "clientId", type: "Lookup", id: 97973, toTable: "client", displayFieldsOfToTable: "Name" }
      ]
    },
    {
      id: 5427,
      name: "invoice",
      label: "Invoice",
      plural: "Invoices",
      icon: "fileText",
      fields: [
        { name: "Id", label: "Id", type: "Number", id: 97980 },
        { name: "Name", label: "Name", type: "Text", id: 97981 },
        { name: "Tags", label: "Tags", type: "Tag", id: 97982 },
        { name: "Owner", label: "Owner", type: "Lookup", id: 97983, displayFieldsOfToTable: "Name" },
        { name: "CreatedOn", label: "Created On", type: "DateTime", id: 97984 },
        { name: "CreatedBy", label: "Created By", type: "Lookup", id: 97985, displayFieldsOfToTable: "Name" },
        { name: "ModifiedOn", label: "Modified On", type: "DateTime", id: 97986 },
        { name: "ModifiedBy", label: "Modified By", type: "Lookup", id: 97987, displayFieldsOfToTable: "Name" },
        { name: "DeletedOn", label: "Deleted On", type: "DateTime", id: 97988 },
        { name: "DeletedBy", label: "Deleted By", type: "Lookup", id: 97989, displayFieldsOfToTable: "Name" },
        { name: "IsDeleted", label: "Is Deleted", type: "Boolean", id: 97990 },
        { name: "InSandbox", label: "In Sandbox", type: "Boolean", id: 97991 },
        { name: "projectIds", label: "projectIds", type: "MultiPicklist", id: 97993 },
        { name: "status", label: "status", type: "Picklist", id: 97994, picklistValues: "draft,sent,paid,overdue" },
        { name: "issueDate", label: "issueDate", type: "Date", id: 97995 },
        { name: "dueDate", label: "dueDate", type: "Date", id: 97996 },
        { name: "amount", label: "amount", type: "Currency", id: 97997 },
        { name: "notes", label: "notes", type: "MultilineText", id: 97998 },
        { name: "template", label: "template", type: "Picklist", id: 97999, picklistValues: "standard,minimal,professional" },
        { name: "clientId", label: "clientId", type: "Lookup", id: 97992, toTable: "client", displayFieldsOfToTable: "Name" }
      ]
    },
    {
      id: 5428,
      name: "expense",
      label: "Expense",
      plural: "Expenses",
      icon: "dollarSign",
      fields: [
        { name: "Id", label: "Id", type: "Number", id: 98000 },
        { name: "Name", label: "Name", type: "Text", id: 98001 },
        { name: "Tags", label: "tags", type: "Tag", id: 98002 },
        { name: "Owner", label: "Owner", type: "Lookup", id: 98003, displayFieldsOfToTable: "Name" },
        { name: "CreatedOn", label: "Created On", type: "DateTime", id: 98004 },
        { name: "CreatedBy", label: "Created By", type: "Lookup", id: 98005, displayFieldsOfToTable: "Name" },
        { name: "ModifiedOn", label: "Modified On", type: "DateTime", id: 98006 },
        { name: "ModifiedBy", label: "Modified By", type: "Lookup", id: 98007, displayFieldsOfToTable: "Name" },
        { name: "DeletedOn", label: "Deleted On", type: "DateTime", id: 98008 },
        { name: "DeletedBy", label: "Deleted By", type: "Lookup", id: 98009, displayFieldsOfToTable: "Name" },
        { name: "IsDeleted", label: "Is Deleted", type: "Boolean", id: 98010 },
        { name: "InSandbox", label: "In Sandbox", type: "Boolean", id: 98011 },
        { name: "date", label: "date", type: "Date", id: 98014 },
        { name: "amount", label: "amount", type: "Currency", id: 98015 },
        { name: "category", label: "category", type: "Picklist", id: 98016, picklistValues: "Software,Hardware,Office Supplies,Hosting,Travel,Meals,Marketing,Professional Services,Rent,Utilities,Other" },
        { name: "description", label: "description", type: "Text", id: 98017 },
        { name: "billable", label: "billable", type: "Boolean", id: 98018 },
        { name: "taxRate", label: "taxRate", type: "Decimal", id: 98019 },
        { name: "taxAmount", label: "taxAmount", type: "Currency", id: 98020 },
        { name: "totalAmount", label: "totalAmount", type: "Currency", id: 98021 },
        { name: "projectId", label: "projectId", type: "Lookup", id: 98012, toTable: "client", displayFieldsOfToTable: "Name" },
        { name: "clientId", label: "clientId", type: "Lookup", id: 98013, toTable: "client", displayFieldsOfToTable: "Name" }
      ]
    },
    {
      id: 5429,
      name: "document",
      label: "Document",
      plural: "Documents",
      icon: "file",
      fields: [
        { name: "Id", label: "Id", type: "Number", id: 98022 },
        { name: "Name", label: "name", type: "Text", id: 98023 },
        { name: "Tags", label: "tags", type: "Tag", id: 98024 },
        { name: "Owner", label: "Owner", type: "Lookup", id: 98025, displayFieldsOfToTable: "Name" },
        { name: "CreatedOn", label: "Created On", type: "DateTime", id: 98026 },
        { name: "CreatedBy", label: "Created By", type: "Lookup", id: 98027, displayFieldsOfToTable: "Name" },
        { name: "ModifiedOn", label: "Modified On", type: "DateTime", id: 98028 },
        { name: "ModifiedBy", label: "Modified By", type: "Lookup", id: 98029, displayFieldsOfToTable: "Name" },
        { name: "DeletedOn", label: "Deleted On", type: "DateTime", id: 98030 },
        { name: "DeletedBy", label: "Deleted By", type: "Lookup", id: 98031, displayFieldsOfToTable: "Name" },
        { name: "IsDeleted", label: "Is Deleted", type: "Boolean", id: 98032 },
        { name: "InSandbox", label: "In Sandbox", type: "Boolean", id: 98033 },
        { name: "description", label: "description", type: "MultilineText", id: 98034 },
        { name: "fileType", label: "fileType", type: "Text", id: 98038 },
        { name: "fileName", label: "fileName", type: "Text", id: 98039 },
        { name: "size", label: "size", type: "Number", id: 98040 },
        { name: "access", label: "access", type: "Picklist", id: 98041, picklistValues: "private,shared,public" },
        { name: "encrypted", label: "encrypted", type: "Boolean", id: 98042 },
        { name: "folderId", label: "folderId", type: "Lookup", id: 98035, toTable: "client", displayFieldsOfToTable: "Name" },
        { name: "clientId", label: "clientId", type: "Lookup", id: 98036, toTable: "client", displayFieldsOfToTable: "Name" },
        { name: "projectId", label: "projectId", type: "Lookup", id: 98037, toTable: "client", displayFieldsOfToTable: "Name" }
      ]
    },
    {
      id: 5430,
      name: "folder",
      label: "Folder",
      plural: "Folders",
      icon: "folder",
      fields: [
        { name: "Id", label: "Id", type: "Number", id: 98043 },
        { name: "Name", label: "name", type: "Text", id: 98044 },
        { name: "Tags", label: "Tags", type: "Tag", id: 98045 },
        { name: "Owner", label: "Owner", type: "Lookup", id: 98046, displayFieldsOfToTable: "Name" },
        { name: "CreatedOn", label: "Created On", type: "DateTime", id: 98047 },
        { name: "CreatedBy", label: "Created By", type: "Lookup", id: 98048, displayFieldsOfToTable: "Name" },
        { name: "ModifiedOn", label: "Modified On", type: "DateTime", id: 98049 },
        { name: "ModifiedBy", label: "Modified By", type: "Lookup", id: 98050, displayFieldsOfToTable: "Name" },
        { name: "DeletedOn", label: "Deleted On", type: "DateTime", id: 98051 },
        { name: "DeletedBy", label: "Deleted By", type: "Lookup", id: 98052, displayFieldsOfToTable: "Name" },
        { name: "IsDeleted", label: "Is Deleted", type: "Boolean", id: 98053 },
        { name: "InSandbox", label: "In Sandbox", type: "Boolean", id: 98054 },
        { name: "parentId", label: "parentId", type: "Lookup", id: 98055, toTable: "client", displayFieldsOfToTable: "Name" }
      ]
    }
  ],
  loading: false,
  error: null
};

export const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setTables: (state, action) => {
      state.tables = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const { setTables, setLoading, setError } = tablesSlice.actions;
export default tablesSlice.reducer;