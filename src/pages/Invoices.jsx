import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Plus, 
  Clock, 
  Send, 
  Download, 
  Edit,
  Trash2, 
  Filter, 
  Calendar, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Printer,
  Bell,
  Settings,
  FileCheck,
  Palette,
  ExternalLink,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

const Invoices = () => {
  const dispatch = useDispatch();
  const invoices = useSelector(state => state.invoices);
  const clients = useSelector(state => state.clients);
  const projects = useSelector(state => state.projects);
  const timeEntries = useSelector(state => state.timeEntries);
  const user = useSelector(state => state.user);
  
  const [activeTab, setActiveTab] = useState('all');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'desc' });
  
  // State for the invoice creation wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    projectIds: [],
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
    items: [],
    notes: '',
    template: 'standard',
    status: 'draft'
  });
  
  // State for invoice templates
  const [templates, setTemplates] = useState([
    { id: 'standard', name: 'Standard', primaryColor: '#4f46e5', logoPosition: 'left', showHours: true },
    { id: 'minimal', name: 'Minimal', primaryColor: '#1f2937', logoPosition: 'center', showHours: false },
    { id: 'professional', name: 'Professional', primaryColor: '#0891b2', logoPosition: 'right', showHours: true }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // State for settings
  const [invoiceSettings, setInvoiceSettings] = useState({
    paymentDueDays: 15,
    defaultNotes: 'Thank you for your business!',
    autoSendReminders: false,
    reminderDays: [3, 7],
    reminderTemplate: 'Dear {client},\n\nThis is a friendly reminder that invoice #{invoiceNumber} for {amount} is due on {dueDate}.\n\nBest regards,\n{businessName}'
  });
  
  // State for selected time entries
  const [selectedTimeEntries, setSelectedTimeEntries] = useState([]);
  const [showTimeEntrySelector, setShowTimeEntrySelector] = useState(false);
  
  useEffect(() => {
    // Apply filters and sorting to invoices
    let filtered = [...invoices];
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        const clientName = client ? client.name.toLowerCase() : '';
        return clientName.includes(searchQuery.toLowerCase()) || 
               invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Sort the results
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredInvoices(filtered);
  }, [invoices, filterStatus, searchQuery, sortConfig, clients]);
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Utility function to get client by id
  const getClient = (clientId) => {
    return clients.find(client => client.id === clientId) || {};
  };
  
  // Utility function to get project by id
  const getProject = (projectId) => {
    return projects.find(project => project.id === projectId) || {};
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'draft': return <FileText size={16} />;
      case 'sent': return <Send size={16} />;
      case 'paid': return <CheckCircle size={16} />;
      case 'overdue': return <AlertCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };
  
  // Handle creating new invoice
  const handleCreateInvoice = () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
      return;
    }
    
    const invoiceId = 'INV-' + Date.now().toString().slice(-6);
    const newInvoiceWithId = {
      ...newInvoice,
      id: invoiceId,
      amount: newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
    };
    
    // This would dispatch to Redux in a real implementation
    dispatch({ type: 'ADD_INVOICE', payload: newInvoiceWithId });
    
    toast.success('Invoice created successfully');
    setWizardStep(1);
    setNewInvoice({
      clientId: '',
      projectIds: [],
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
      items: [],
      notes: '',
      template: 'standard',
      status: 'draft'
    });
    setSelectedTimeEntries([]);
    setActiveTab('all');
  };
  
  // Handle selecting time entries to add to invoice
  const handleSelectTimeEntries = () => {
    setNewInvoice(prev => {
      const items = selectedTimeEntries.map(entry => {
        const project = getProject(entry.projectId);
        return {
          description: `${project.name}: ${entry.description}`,
          quantity: entry.duration / 3600, // Convert seconds to hours
          rate: entry.hourlyRate,
          amount: (entry.duration / 3600) * entry.hourlyRate
        };
      });
      
      return {
        ...prev,
        items: [...prev.items, ...items],
        projectIds: [...new Set([...prev.projectIds, ...selectedTimeEntries.map(e => e.projectId)])]
      };
    });
    
    setShowTimeEntrySelector(false);
  };
  
  // Handle sending invoice
  const handleSendInvoice = (invoice) => {
    // In a real app, this would connect to an email API
    const updatedInvoice = { ...invoice, status: 'sent' };
    dispatch({ type: 'UPDATE_INVOICE', payload: updatedInvoice });
    toast.success('Invoice sent successfully');
  };
  
  // Handle setting invoice status to paid
  const handleMarkAsPaid = (invoice) => {
    const updatedInvoice = { ...invoice, status: 'paid' };
    dispatch({ type: 'UPDATE_INVOICE', payload: updatedInvoice });
    toast.success('Invoice marked as paid');
  };
  
  // Handle sending payment reminder
  const handleSendReminder = (invoice) => {
    const client = getClient(invoice.clientId);
    // In a real app, this would connect to an email API
    toast.success(`Payment reminder sent to ${client.name}`);
  };
  
  // Handle deleting invoice
  const handleDeleteInvoice = (invoiceId) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      dispatch({ type: 'DELETE_INVOICE', payload: invoiceId });
      toast.success('Invoice deleted successfully');
    }
  };
  
  // Handle saving template
  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    setTemplates(prev => 
      prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
    );
    
    setEditingTemplate(null);
    toast.success('Template saved successfully');
  };
  
  // Handle saving settings
  const handleSaveSettings = () => {
    toast.success('Invoice settings saved successfully');
  };
  
  // Tabs for organizing content
  const tabs = [
    { id: 'all', label: 'All Invoices', icon: FileText },
    { id: 'new', label: 'New Invoice', icon: Plus },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-primary" />
          Invoices
        </h1>
      </div>
      
      {/* Tabs navigation */}
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-surface-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* All Invoices Tab */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className="text-surface-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <select
                className="select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <button 
                className="btn btn-primary" 
                onClick={() => setActiveTab('new')}
              >
                <Plus size={18} className="mr-1" /> New Invoice
              </button>
            </div>
          </div>
          
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-surface-100 dark:bg-surface-800">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        Invoice #
                        {sortConfig.key === 'id' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">Client</th>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700"
                      onClick={() => handleSort('issueDate')}
                    >
                      <div className="flex items-center">
                        Issue Date
                        {sortConfig.key === 'issueDate' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700"
                      onClick={() => handleSort('dueDate')}
                    >
                      <div className="flex items-center">
                        Due Date
                        {sortConfig.key === 'dueDate' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        {sortConfig.key === 'amount' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(invoice => {
                    const client = getClient(invoice.clientId);
                    return (
                      <tr 
                        key={invoice.id} 
                        className="border-b border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800"
                      >
                        <td className="px-4 py-3 font-medium">{invoice.id}</td>
                        <td className="px-4 py-3">{client.name}</td>
                        <td className="px-4 py-3">{invoice.issueDate}</td>
                        <td className="px-4 py-3">{invoice.dueDate}</td>
                        <td className="px-4 py-3 text-right">${invoice.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {getStatusIcon(invoice.status)}
                              <span className="ml-1">
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => handleSendInvoice(invoice)}
                              disabled={invoice.status === 'sent' || invoice.status === 'paid'}
                              className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Send Invoice"
                            >
                              <Send size={18} />
                            </button>
                            <button 
                              onClick={() => handleMarkAsPaid(invoice)}
                              disabled={invoice.status === 'paid'}
                              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as Paid"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleSendReminder(invoice)}
                              disabled={invoice.status !== 'sent' && invoice.status !== 'overdue'}
                              className="p-1 text-amber-600 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Send Reminder"
                            >
                              <Bell size={18} />
                            </button>
                            <button 
                              className="p-1 text-purple-600 hover:text-purple-800"
                              title="Download PDF"
                            >
                              <Download size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete Invoice"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
                <FileText size={28} className="text-surface-500" />
              </div>
              <h3 className="text-lg font-medium">No invoices found</h3>
              <p className="text-surface-500 mt-1">Create your first invoice to get started</p>
              <button 
                className="btn btn-primary mt-4" 
                onClick={() => setActiveTab('new')}
              >
                <Plus size={18} className="mr-1" /> Create Invoice
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* New Invoice Tab */}
      {activeTab === 'new' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {wizardStep === 1 && "Client & Project Details"}
              {wizardStep === 2 && "Invoice Items"}
              {wizardStep === 3 && "Review & Create"}
            </h2>
            <div className="flex items-center text-sm text-surface-500">
              Step {wizardStep} of 3
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-surface-200 dark:bg-surface-700 h-2 rounded-full">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(wizardStep / 3) * 100}%` }}
            ></div>
          </div>
          
          {/* Step 1: Client & Project Selection */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="client" className="form-label">Client</label>
                <select 
                  id="client" 
                  className="select"
                  value={newInvoice.clientId}
                  onChange={(e) => setNewInvoice({...newInvoice, clientId: e.target.value})}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="form-label">Invoice Date</label>
                <input 
                  type="date" 
                  className="input"
                  value={newInvoice.issueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  className="input"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Template</label>
                <select 
                  className="select"
                  value={newInvoice.template}
                  onChange={(e) => setNewInvoice({...newInvoice, template: e.target.value})}
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  className="btn btn-primary"
                  disabled={!newInvoice.clientId}
                  onClick={() => setWizardStep(2)}
                >
                  Next: Add Items
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Invoice Items */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowTimeEntrySelector(true)}
                >
                  <Clock size={18} className="mr-1" />
                  Import Time Entries
                </button>
                
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setNewInvoice(prev => ({
                      ...prev,
                      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
                    }));
                  }}
                >
                  <Plus size={18} className="mr-1" />
                  Add Item
                </button>
              </div>
              
              {/* Invoice Items List */}
              <div className="space-y-4">
                {newInvoice.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-lg">
                    <p className="text-surface-500">No items added yet</p>
                    <p className="text-surface-400 text-sm mt-1">Add items manually or import from time entries</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newInvoice.items.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border border-surface-200 dark:border-surface-700 rounded-lg">
                        <div className="flex-1">
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            className="input"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...newInvoice.items];
                              newItems[index].description = e.target.value;
                              setNewInvoice({...newInvoice, items: newItems});
                            }}
                          />
                        </div>
                        <div className="w-24">
                          <label className="form-label">Quantity</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...newInvoice.items];
                              newItems[index].quantity = parseFloat(e.target.value);
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                              setNewInvoice({...newInvoice, items: newItems});
                            }}
                          />
                        </div>
                        <div className="w-24">
                          <label className="form-label">Rate</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input"
                            value={item.rate}
                            onChange={(e) => {
                              const newItems = [...newInvoice.items];
                              newItems[index].rate = parseFloat(e.target.value);
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                              setNewInvoice({...newInvoice, items: newItems});
                            }}
                          />
                        </div>
                        <div className="w-24">
                          <label className="form-label">Amount</label>
                          <div className="input bg-surface-50 dark:bg-surface-800">
                            ${(item.quantity * item.rate).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              const newItems = newInvoice.items.filter((_, i) => i !== index);
                              setNewInvoice({...newInvoice, items: newItems});
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between border-t border-surface-200 dark:border-surface-700 pt-4">
                      <div className="font-medium">Total</div>
                      <div className="font-medium">${newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="form-label">Notes</label>
                <textarea 
                  className="input min-h-[100px]"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                  placeholder="Add any additional notes or payment instructions..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex justify-between">
                <button 
                  className="btn btn-outline"
                  onClick={() => setWizardStep(1)}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-primary"
                  disabled={newInvoice.items.length === 0}
                  onClick={() => setWizardStep(3)}
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Review and Create */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="card space-y-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{user.businessDetails.name}</h3>
                    <p className="text-surface-500">{user.businessDetails.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">INVOICE</div>
                    <div className="text-primary font-medium">#{`INV-${Date.now().toString().slice(-6)}`}</div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-surface-500">BILL TO</h4>
                    <div className="font-medium">{getClient(newInvoice.clientId).name}</div>
                    <div className="text-surface-500">{getClient(newInvoice.clientId).contactInfo?.email}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex justify-between">
                      <span className="text-surface-500 mr-4">Issue Date:</span>
                      <span>{newInvoice.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-500 mr-4">Due Date:</span>
                      <span>{newInvoice.dueDate}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-surface-500 mr-4">Amount Due:</span>
                      <span>${newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700">
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newInvoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-surface-200 dark:border-surface-700">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">${item.rate.toFixed(2)}</td>
                        <td className="py-3 text-right">${(item.quantity * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="py-3 text-right font-medium">Total:</td>
                      <td className="py-3 text-right font-bold">${newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
                
                {newInvoice.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-surface-500">NOTES</h4>
                    <p className="text-surface-700 dark:text-surface-300">{newInvoice.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex justify-between">
                <button 
                  className="btn btn-outline"
                  onClick={() => setWizardStep(2)}
                >
                  Previous
                </button>
                <div className="space-x-2">
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      handleCreateInvoice();
                      toast.success("Invoice saved as draft");
                    }}
                  >
                    Save as Draft
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setNewInvoice({...newInvoice, status: 'sent'});
                      handleCreateInvoice();
                      toast.success("Invoice created and sent");
                    }}
                  >
                    Create & Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map(template => (
              <div 
                key={template.id}
                className="card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setEditingTemplate({...template})}
              >
                <div className="pb-3 mb-3 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
                  <h3 className="font-medium">{template.name}</h3>
                  <Edit size={16} className="text-surface-500" />
                </div>
                <div 
                  className="h-40 rounded-lg border border-surface-200 dark:border-surface-700 flex items-center justify-center overflow-hidden" 
                  style={{ backgroundColor: template.primaryColor + '10' }}
                >
                  <div className="w-full p-3 text-xs">
                    <div className={`flex justify-${template.logoPosition} mb-4`}>
                      <div className="w-8 h-8 rounded-full bg-surface-300 dark:bg-surface-600"></div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="w-16 h-2 bg-surface-300 dark:bg-surface-600 rounded mb-1"></div>
                        <div className="w-12 h-2 bg-surface-300 dark:bg-surface-600 rounded"></div>
                      </div>
                      <div>
                        <div className="w-16 h-2 bg-surface-300 dark:bg-surface-600 rounded mb-1"></div>
                        <div className="w-12 h-2 bg-surface-300 dark:bg-surface-600 rounded"></div>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-surface-200 dark:border-surface-700 pt-2">
                      <div className="flex justify-between mb-1">
                        <div className="w-24 h-2 bg-surface-300 dark:bg-surface-600 rounded"></div>
                        <div className="w-8 h-2 bg-surface-300 dark:bg-surface-600 rounded"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-16 h-2 bg-surface-300 dark:bg-surface-600 rounded"></div>
                        <div className="w-10 h-2 bg-surface-300 dark:bg-surface-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div 
              className="card cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center h-[180px] border-2 border-dashed"
              onClick={() => {
                setEditingTemplate({
                  id: `template-${Date.now()}`,
                  name: 'Custom Template',
                  primaryColor: '#4f46e5',
                  logoPosition: 'left',
                  showHours: true
                });
              }}
            >
              <Plus size={24} className="text-surface-400 mb-2" />
              <span className="text-surface-600 dark:text-surface-400">Create New Template</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-8">
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Invoice Settings</h3>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Default Payment Terms (Days)</label>
                <input 
                  type="number" 
                  className="input" 
                  value={invoiceSettings.paymentDueDays}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, paymentDueDays: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Default Invoice Notes</label>
                <textarea 
                  className="input min-h-[100px]"
                  value={invoiceSettings.defaultNotes}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultNotes: e.target.value})}
                ></textarea>
              </div>
              
              <div className="form-group flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="autoReminders"
                  checked={invoiceSettings.autoSendReminders}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, autoSendReminders: e.target.checked})}
                />
                <label htmlFor="autoReminders" className="cursor-pointer">
                  Automatically send payment reminders
                </label>
              </div>
              
              {invoiceSettings.autoSendReminders && (
                <div className="form-group">
                  <label className="form-label">Reminder Template</label>
                  <textarea 
                    className="input min-h-[150px]"
                    value={invoiceSettings.reminderTemplate}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, reminderTemplate: e.target.value})}
                  ></textarea>
                  <p className="text-xs text-surface-500 mt-1">
                    Use placeholders: {'{client}'}, {'{invoiceNumber}'}, {'{amount}'}, {'{dueDate}'}, {'{businessName}'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                className="btn btn-primary"
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;