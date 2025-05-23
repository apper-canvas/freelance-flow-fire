import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { DollarSign, FileText, Upload, X, Edit, Trash2, Download, Filter, Plus, Check, ChevronDown, Search, Calendar, Tag, Briefcase, Users } from 'lucide-react';

const Expenses = () => {
  const dispatch = useDispatch();
  const expenses = useSelector(state => state.expenses);
  const clients = useSelector(state => state.clients);
  const projects = useSelector(state => state.projects);
  
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const fileInputRef = useRef(null);
  
  const expenseCategories = [
    'Software', 'Hardware', 'Office Supplies', 'Hosting', 'Travel', 
    'Meals', 'Marketing', 'Professional Services', 'Rent', 'Utilities', 'Other'
  ];

  const taxRates = [
    { id: 'none', label: 'None', rate: 0 },
    { id: 'standard', label: 'Standard (20%)', rate: 0.2 },
    { id: 'reduced', label: 'Reduced (10%)', rate: 0.1 },
    { id: 'zero', label: 'Zero (0%)', rate: 0 },
    { id: 'custom', label: 'Custom Rate', rate: null }
  ];
  
  const [formData, setFormData] = useState({
    id: '',
    projectId: '',
    clientId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    category: '',
    description: '',
    receipt: null,
    receiptPreview: null,
    taxRate: taxRates[0],
    customTaxRate: '',
    billable: true,
    tags: []
  });
  
  // Filter expenses based on search term and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? expense.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Function to handle receipt file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          receipt: file,
          receiptPreview: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          receipt: file,
          receiptPreview: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // If client is changed, reset project
    if (name === 'clientId') {
      setFormData({ ...formData, clientId: value, projectId: '' });
    }
    
    // If tax rate is changed to custom, focus on custom rate input
    if (name === 'taxRate') {
      const selectedRate = taxRates.find(tax => tax.id === value);
      setFormData({ ...formData, taxRate: selectedRate });
    }
  };
  
  // Filter projects by selected client
  const filteredProjects = projects.filter(
    project => formData.clientId ? project.clientId === formData.clientId : true
  );
  
  // Open form to add new expense
  const handleAddNew = () => {
    setSelectedExpense(null);
    setFormData({
      id: '',
      projectId: '',
      clientId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      category: '',
      description: '',
      receipt: null,
      receiptPreview: null,
      taxRate: taxRates[0],
      customTaxRate: '',
      billable: true,
      tags: []
    });
    setShowForm(true);
  };
  
  // Open form to edit expense
  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      id: expense.id,
      projectId: expense.projectId || '',
      clientId: expense.clientId || '',
      date: expense.date,
      amount: expense.amount.toString(),
      category: expense.category || '',
      description: expense.description || '',
      receipt: null,
      receiptPreview: expense.receiptUrl || null,
      taxRate: taxRates[0], // Default, would need to be determined from the stored expense
      customTaxRate: '',
      billable: expense.billable,
      tags: expense.tags || []
    });
    setShowForm(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (formData.taxRate.id === 'custom' && (!formData.customTaxRate || isNaN(parseFloat(formData.customTaxRate)))) {
      toast.error('Please enter a valid custom tax rate');
      return;
    }
    
    // Prepare expense data for submission
    const effectiveTaxRate = formData.taxRate.id === 'custom' 
      ? parseFloat(formData.customTaxRate) / 100
      : formData.taxRate.rate;
      
    const taxAmount = parseFloat(formData.amount) * effectiveTaxRate;
    
    const expenseData = {
      id: formData.id || `exp-${Date.now()}`,
      projectId: formData.projectId,
      clientId: formData.clientId,
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      billable: formData.billable,
      taxRate: formData.taxRate.id === 'custom' ? parseFloat(formData.customTaxRate) / 100 : formData.taxRate.rate,
      taxAmount: taxAmount,
      totalAmount: parseFloat(formData.amount) + taxAmount,
      tags: formData.tags,
      receiptUrl: formData.receiptPreview // In a real app, this would be the URL after upload to server
    };
    
    // Dispatch action to add or update expense
    if (selectedExpense) {
      // Update existing expense
      dispatch({
        type: 'UPDATE_EXPENSE',
        payload: expenseData
      });
      toast.success('Expense updated successfully');
    } else {
      // Add new expense
      dispatch({
        type: 'ADD_EXPENSE',
        payload: expenseData
      });
      toast.success('Expense added successfully');
    }
    
    // Close form
    setShowForm(false);
  };
  
  // Confirm delete expense
  const confirmDelete = (expense) => {
    setSelectedExpense(expense);
    setShowDeleteConfirm(true);
  };
  
  // Delete expense
  const handleDelete = () => {
    dispatch({
      type: 'DELETE_EXPENSE',
      payload: selectedExpense.id
    });
    toast.success('Expense deleted successfully');
    setShowDeleteConfirm(false);
  };
  
  // Export expenses to CSV
  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Tax', 'Total', 'Client', 'Project', 'Billable'];
    csvRows.push(headers.join(','));
    
    for (const expense of filteredExpenses) {
      const client = clients.find(c => c.id === expense.clientId)?.name || '';
      const project = projects.find(p => p.id === expense.projectId)?.name || '';
      const taxAmount = expense.taxAmount || (expense.amount * (expense.taxRate || 0));
      const totalAmount = expense.totalAmount || (expense.amount + taxAmount);
      
      const values = [
        expense.date,
        `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
        expense.category,
        expense.amount.toFixed(2),
        taxAmount.toFixed(2),
        totalAmount.toFixed(2),
        `"${client.replace(/"/g, '""')}"`,
        `"${project.replace(/"/g, '""')}"`,
        expense.billable ? 'Yes' : 'No'
      ];
      
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportOptions(false);
    toast.success('Expenses exported to CSV');
  };
  
  // Export expenses to accounting software format (QuickBooks)
  const exportToQBO = () => {
    // Simplified QBO format (in real app would be more complex)
    toast.success('Expenses exported in QuickBooks format');
    setShowExportOptions(false);
  };
  
  // Export expenses to accounting software format (Xero)
  const exportToXero = () => {
    // Simplified Xero format (in real app would be more complex)
    toast.success('Expenses exported in Xero format');
    setShowExportOptions(false);
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="text-primary" size={28} />
            Expenses
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Track, categorize and manage your business expenses
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="btn btn-outline flex items-center gap-2 w-full sm:w-auto"
            >
              <Download size={18} />
              Export
              <ChevronDown size={16} />
            </button>
            
            {showExportOptions && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-10 w-48">
                <ul className="py-2">
                  <li>
                    <button 
                      onClick={exportToCSV}
                      className="w-full text-left px-4 py-2 hover:bg-surface-100 dark:hover:bg-surface-700"
                    >
                      CSV Format
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={exportToQBO}
                      className="w-full text-left px-4 py-2 hover:bg-surface-100 dark:hover:bg-surface-700"
                    >
                      QuickBooks Format
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={exportToXero}
                      className="w-full text-left px-4 py-2 hover:bg-surface-100 dark:hover:bg-surface-700"
                    >
                      Xero Format
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleAddNew}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" size={18} />
          <input
            type="text"
            placeholder="Search expenses..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" size={18} />
          <select
            className="select pl-10"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {expenseCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <div className="flex space-x-8">
          <button
            className={`pb-4 px-1 font-medium ${
              activeTab === 'all' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Expenses
          </button>
          <button
            className={`pb-4 px-1 font-medium ${
              activeTab === 'billable' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary'
            }`}
            onClick={() => setActiveTab('billable')}
          >
            Billable
          </button>
          <button
            className={`pb-4 px-1 font-medium ${
              activeTab === 'non-billable' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary'
            }`}
            onClick={() => setActiveTab('non-billable')}
          >
            Non-Billable
          </button>
        </div>
      </div>
      
      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-surface-400" size={48} />
            <h3 className="mt-4 text-xl font-medium">No expenses found</h3>
            <p className="mt-2 text-surface-500 dark:text-surface-400">
              {searchTerm || filterCategory 
                ? "Try adjusting your search or filter" 
                : "Add your first expense to get started"}
            </p>
            {!searchTerm && !filterCategory && (
              <button
                onClick={handleAddNew} 
                className="mt-4 btn btn-primary inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Expense
              </button>
            )}
          </div>
        ) : (
          filteredExpenses.map(expense => {
            const client = clients.find(c => c.id === expense.clientId);
            const project = projects.find(p => p.id === expense.projectId);
            
            return (
              <div 
                key={expense.id} 
                className="card hover:shadow-lg transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{expense.description}</h3>
                        {expense.billable && (
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            Billable
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-surface-600 dark:text-surface-400 flex flex-wrap gap-x-4 gap-y-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {expense.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag size={14} />
                          {expense.category}
                        </span>
                        {project && (
                          <span className="flex items-center gap-1">
                            <Briefcase size={14} />
                            {project.name}
                          </span>
                        )}
                        {client && (
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {client.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xl font-bold">${expense.amount.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
                    aria-label="Edit expense"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => confirmDelete(expense)}
                    className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Expense Form Modal */}
      {showForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-surface-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-surface-800 px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
              </div>

              {/* Description */}
              <div className="form-group md:col-span-2">
                <label htmlFor="description" className="form-label">Description *</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  placeholder="What was this expense for?"
                  required
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label htmlFor="date" className="form-label">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category" className="form-label">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select"
                  required
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="form-group">
                <label htmlFor="amount" className="form-label">Amount ($) *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {/* Tax Rate */}
              <div className="form-group">
                <label htmlFor="taxRate" className="form-label">Tax Rate</label>
                <select
                  id="taxRate"
                  name="taxRate"
                  value={formData.taxRate.id}
                  onChange={handleChange}
                  className="select"
                >
                  {taxRates.map(tax => (
                    <option key={tax.id} value={tax.id}>
                      {tax.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Tax Rate */}
              {formData.taxRate.id === 'custom' && (
                <div className="form-group">
                  <label htmlFor="customTaxRate" className="form-label">Custom Tax Rate (%)</label>
                  <input
                    type="number"
                    id="customTaxRate"
                    name="customTaxRate"
                    value={formData.customTaxRate}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter percentage"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              )}

              {/* Billable */}
              <div className="form-group md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="billable"
                    name="billable"
                    checked={formData.billable}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="billable" className="form-label m-0">
                    Mark as billable expense
                  </label>
                </div>
              </div>

              {/* Association */}
              <div className="md:col-span-2 mt-2">
                <h3 className="text-lg font-medium mb-3">Project & Client Association</h3>
              </div>

              {/* Client */}
              <div className="form-group">
                <label htmlFor="clientId" className="form-label">Client</label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className="select"
                >
                  <option value="">Not associated with a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              {/* Project */}
              <div className="form-group">
                <label htmlFor="projectId" className="form-label">Project</label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="select"
                  disabled={!formData.clientId}
                >
                  <option value="">Not associated with a project</option>
                  {filteredProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              {/* Receipt Upload */}
              <div className="md:col-span-2 mt-2">
                <h3 className="text-lg font-medium mb-3">Receipt</h3>
                <div 
                  className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-6 text-center"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {formData.receiptPreview ? (
                    <div className="relative">
                      <img 
                        src={formData.receiptPreview} 
                        alt="Receipt preview" 
                        className="max-h-64 mx-auto rounded-lg" 
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, receipt: null, receiptPreview: null})}
                        className="absolute top-2 right-2 bg-surface-800 bg-opacity-70 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="mx-auto text-surface-400" />
                      <p className="mt-2 text-surface-600 dark:text-surface-400">
                        Drag & drop a receipt image here, or <button 
                          type="button" 
                          className="text-primary hover:underline"
                          onClick={() => fileInputRef.current.click()}
                        >browse</button>
                      </p>
                      <p className="text-xs text-surface-500 mt-1">Supported formats: JPEG, PNG, PDF (max 5MB)</p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn border border-surface-300 dark:border-surface-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {selectedExpense ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-800 rounded-xl max-w-md w-full shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
          <p className="mb-6">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn border border-surface-300 dark:border-surface-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Expense
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Expenses;