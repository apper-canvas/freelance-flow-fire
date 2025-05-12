import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import ClientForm from '../components/ClientForm';

function Clients() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [clientFilter, setClientFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [showCommunicationForm, setShowCommunicationForm] = useState(false);
  const [communicationNote, setCommunicationNote] = useState('');

  const dispatch = useDispatch();

  // Get data from store
  const clients = useSelector(state => state.clients);
  const projects = useSelector(state => state.projects);
  const invoices = useSelector(state => state.invoices);
  const timeEntries = useSelector(state => state.timeEntries);

  // Icons
  const UserPlusIcon = getIcon('UserPlus');
  const SearchIcon = getIcon('Search');
  const EditIcon = getIcon('Edit');
  const ArchiveIcon = getIcon('Archive');
  const EyeIcon = getIcon('Eye');
  const MessageSquareIcon = getIcon('MessageSquare');
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const CheckIcon = getIcon('Check');
  const XIcon = getIcon('X');
  const UsersIcon = getIcon('Users');
  const FileTextIcon = getIcon('FileText');
  const ClockIcon = getIcon('Clock');
  const DollarSignIcon = getIcon('DollarSign');
  const FolderIcon = getIcon('Folder');
  const TrashIcon = getIcon('Trash');

  // Filtered clients
  const filteredClients = clients.filter(client => {
    const matchesFilter = clientFilter === 'all' || client.status === clientFilter;
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.contactInfo.email && client.contactInfo.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.contactInfo.phone && client.contactInfo.phone.includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  // Add new client
  const addClient = (clientData) => {
    const newClient = {
      id: Date.now().toString(),
      ...clientData,
      status: 'active',
      communicationLog: []
    };
    
    dispatch({ type: 'ADD_CLIENT', payload: newClient });
    toast.success('Client added successfully!');
    setShowAddForm(false);
  };

  // Update client
  const updateClient = (clientData) => {
    dispatch({ type: 'UPDATE_CLIENT', payload: clientData });
    toast.success('Client updated successfully!');
    setShowEditForm(false);
  };

  // Toggle client status (active/inactive)
  const toggleClientStatus = (client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    const updatedClient = { ...client, status: newStatus };
    
    dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
    toast.info(`Client ${newStatus === 'active' ? 'activated' : 'archived'}`);
  };

  // Delete client
  const confirmDeleteClient = (client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  const deleteClient = () => {
    if (!clientToDelete) return;
    
    dispatch({ type: 'DELETE_CLIENT', payload: clientToDelete.id });
    
    if (selectedClient && selectedClient.id === clientToDelete.id) {
      setSelectedClient(null);
    }
    
    toast.success('Client deleted successfully');
    setShowDeleteConfirm(false);
    setClientToDelete(null);
  };

  // Add communication log entry
  const addCommunicationEntry = () => {
    if (!communicationNote.trim() || !selectedClient) return;
    
    const updatedClient = {
      ...selectedClient,
      communicationLog: [
        ...(selectedClient.communicationLog || []),
        {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          note: communicationNote,
          type: 'note'
        }
      ]
    };
    
    dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
    setCommunicationNote('');
    setShowCommunicationForm(false);
    toast.success('Communication log updated');
    setSelectedClient(updatedClient);
  };

  // Get client projects
  const getClientProjects = (clientId) => {
    return projects.filter(project => project.clientId === clientId);
  };

  // Get client invoices
  const getClientInvoices = (clientId) => {
    return invoices.filter(invoice => invoice.clientId === clientId);
  };

  // Get total time tracked for client
  const getClientTimeTracked = (clientId) => {
    return timeEntries
      .filter(entry => entry.clientId === clientId)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  // Format time in hours
  const formatHours = (seconds) => {
    const hours = seconds / 3600;
    return hours.toFixed(1);
  };

  return (
    <div>
      {selectedClient ? (
        // Client Detail View
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedClient(null)}
              className="mr-4 p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <h1 className="text-2xl font-bold">{selectedClient.name}</h1>
            <div className="ml-auto flex space-x-2">
              <button 
                onClick={() => {
                  setShowEditForm(true);
                }}
                className="btn btn-outline"
              >
                <EditIcon size={16} className="mr-1" />
                Edit
              </button>
              <button 
                onClick={() => toggleClientStatus(selectedClient)} 
                className={`btn ${selectedClient.status === 'active' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
              >
                {selectedClient.status === 'active' ? (
                  <><ArchiveIcon size={16} className="mr-1" /> Archive</>
                ) : (
                  <><CheckIcon size={16} className="mr-1" /> Activate</>
                )}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Info */}
            <div className="lg:col-span-1">
              <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Email</p>
                    <p>{selectedClient.contactInfo.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Phone</p>
                    <p>{selectedClient.contactInfo.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Status</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedClient.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {selectedClient.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Communication Log */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Communication Log</h3>
                  <button 
                    onClick={() => setShowCommunicationForm(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <MessageSquareIcon size={14} className="mr-1" />
                    Add Note
                  </button>
                </div>
                
                {showCommunicationForm && (
                  <div className="mb-4 p-3 border border-surface-200 dark:border-surface-700 rounded-lg">
                    <textarea
                      value={communicationNote}
                      onChange={(e) => setCommunicationNote(e.target.value)}
                      placeholder="Enter communication details..."
                      className="input mb-2"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setShowCommunicationForm(false)}
                        className="btn bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={addCommunicationEntry}
                        className="btn btn-primary"
                        disabled={!communicationNote.trim()}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {selectedClient.communicationLog && selectedClient.communicationLog.length > 0 ? (
                    selectedClient.communicationLog.map(entry => (
                      <div key={entry.id} className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                          <span className="text-xs text-surface-500">{new Date(entry.date).toLocaleTimeString()}</span>
                        </div>
                        <p className="mt-1 text-sm">{entry.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-surface-500 dark:text-surface-400 py-4">No communication history yet</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {/* Client Projects */}
              <div className="card mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Projects</h3>
                  <div className="text-sm text-surface-500 dark:text-surface-400">
                    Total Time: <span className="font-semibold">{formatHours(getClientTimeTracked(selectedClient.id))}h</span>
                  </div>
                </div>
                
                {getClientProjects(selectedClient.id).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Budget</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                        {getClientProjects(selectedClient.id).map(project => (
                          <tr key={project.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                            <td className="px-4 py-3 text-sm font-medium">{project.name}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                              }`}>
                                {project.status === 'active' ? 'Active' : 
                                 project.status === 'completed' ? 'Completed' : 'On Hold'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">${project.hourlyRate}/hr</td>
                            <td className="px-4 py-3 text-sm">
                              ${project.budget.amount} 
                              <span className="text-xs text-surface-500 dark:text-surface-400 ml-1">
                                ({project.budget.type})
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-surface-500 dark:text-surface-400 py-4">No projects yet</p>
                )}
              </div>
              
              {/* Client Invoices */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Invoice History</h3>
                
                {getClientInvoices(selectedClient.id).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Invoice #</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                        {getClientInvoices(selectedClient.id).map(invoice => (
                          <tr key={invoice.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                            <td className="px-4 py-3 text-sm font-medium">INV-{invoice.id}</td>
                            <td className="px-4 py-3 text-sm">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm">${invoice.amount}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                              }`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-surface-500 dark:text-surface-400 py-4">No invoices yet</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Edit Client Form Modal */}
          {showEditForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Edit Client</h3>
                    <button onClick={() => setShowEditForm(false)} className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
                      <XIcon size={20} />
                    </button>
                  </div>
                  <ClientForm 
                    initialData={selectedClient}
                    onSubmit={updateClient}
                    onCancel={() => setShowEditForm(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        // Clients List View
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Clients</h1>
              <p className="text-surface-600 dark:text-surface-400">Manage your client relationships</p>
            </div>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="btn btn-primary mt-4 md:mt-0"
            >
              <UserPlusIcon size={18} className="mr-2" />
              Add New Client
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-surface-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setClientFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  clientFilter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setClientFilter('active')}
                className={`px-4 py-2 rounded-lg ${
                  clientFilter === 'active' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setClientFilter('inactive')}
                className={`px-4 py-2 rounded-lg ${
                  clientFilter === 'inactive' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
          
          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <div key={client.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <UsersIcon size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-surface-500 dark:text-surface-400">{client.contactInfo.email}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col items-center p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                      <div className="flex items-center mb-1">
                        <FolderIcon size={14} className="text-primary mr-1" />
                        <span className="text-sm">Projects</span>
                      </div>
                      <span className="text-lg font-semibold">{getClientProjects(client.id).length}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                      <div className="flex items-center mb-1">
                        <ClockIcon size={14} className="text-secondary mr-1" />
                        <span className="text-sm">Hours</span>
                      </div>
                      <span className="text-lg font-semibold">{formatHours(getClientTimeTracked(client.id))}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedClient(client)} 
                      className="btn btn-outline flex-1"
                    >
                      <EyeIcon size={16} className="mr-1" />
                      View
                    </button>
                    <button 
                      onClick={() => toggleClientStatus(client)} 
                      className="btn btn-outline flex-1"
                    >
                      {client.status === 'active' ? (
                        <><ArchiveIcon size={16} className="mr-1" /> Archive</>
                      ) : (
                        <><CheckIcon size={16} className="mr-1" /> Activate</>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="card py-12 text-center">
                  <UsersIcon size={48} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No clients found</h3>
                  <p className="text-surface-500 dark:text-surface-400 mb-6">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"`
                      : clientFilter !== 'all' 
                        ? `No ${clientFilter} clients found` 
                        : "You haven't added any clients yet"
                    }
                  </p>
                  {!searchQuery && clientFilter === 'all' && (
                    <button 
                      onClick={() => setShowAddForm(true)} 
                      className="btn btn-primary mx-auto"
                    >
                      <UserPlusIcon size={18} className="mr-2" />
                      Add Your First Client
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Add Client Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Add New Client</h3>
                    <button onClick={() => setShowAddForm(false)} className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
                      <XIcon size={20} />
                    </button>
                  </div>
                  <ClientForm 
                    onSubmit={addClient}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 p-3 bg-red-100 dark:bg-red-900 rounded-full">
                      <TrashIcon size={24} className="text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Delete Client</h3>
                      <p className="text-surface-600 dark:text-surface-400">This action cannot be undone.</p>
                    </div>
                  </div>
                  <p className="mb-6">
                    Are you sure you want to delete <span className="font-semibold">{clientToDelete?.name}</span>?
                    All associated projects, time entries, and invoices will become unassociated.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={deleteClient} 
                      className="btn bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete Client
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default Clients;