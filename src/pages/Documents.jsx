import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  File, 
  Folder, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Tag,
  Share,
  Lock,
  Users,
  Briefcase,
  FileText,
  Clock,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle,
  Eye,
  PlusCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';

const Documents = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [expandedFolders, setExpandedFolders] = useState(['root']);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [hoveredDocument, setHoveredDocument] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [documentFormData, setDocumentFormData] = useState({
    id: '',
    name: '',
    description: '',
    folderId: 'root',
    tags: [],
    clientId: '',
    projectId: '',
    file: null,
    access: 'private',
    encrypted: false
  });
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    parentId: 'root'
  });
  const [newTagInput, setNewTagInput] = useState('');
  const fileInputRef = useRef(null);

  // Get data from Redux store
  const documents = useSelector(state => state.documents || []);
  const folders = useSelector(state => state.folders || []);
  const clients = useSelector(state => state.clients || []);
  const projects = useSelector(state => state.projects || []);
  const tags = useSelector(state => state.tags || []);

  // Filtered documents based on active tab, search, and filters
  const getFilteredDocuments = () => {
    let filtered = [...documents];
    
    // Filter by active tab
    if (activeTab === 'contracts') {
      filtered = filtered.filter(doc => doc.type === 'contract');
    } else if (activeTab === 'proposals') {
      filtered = filtered.filter(doc => doc.type === 'proposal');
    } else if (activeTab === 'shared') {
      filtered = filtered.filter(doc => doc.access === 'shared');
    } else if (activeTab === 'secured') {
      filtered = filtered.filter(doc => doc.encrypted);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        doc.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(doc => doc.tags.includes(selectedTag));
    }
    
    // Filter by selected folder
    if (selectedFolder) {
      filtered = filtered.filter(doc => doc.folderId === selectedFolder);
    }
    
    return filtered;
  };

  const filteredDocuments = getFilteredDocuments();

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter(id => id !== folderId));
    } else {
      setExpandedFolders([...expandedFolders, folderId]);
    }
  };

  // Get child folders
  const getChildFolders = (parentId) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  // Recursive function to render folder tree
  const renderFolderTree = (parentId = 'root', level = 0) => {
    const childFolders = getChildFolders(parentId);
    
    if (childFolders.length === 0) {
      return null;
    }
    
    return (
      <ul className={`ml-${level > 0 ? '4' : '0'}`}>
        {childFolders.map(folder => {
          const isExpanded = expandedFolders.includes(folder.id);
          const isSelected = selectedFolder === folder.id;
          
          return (
            <li key={folder.id} className="py-1">
              <div 
                className={`flex items-center py-1 px-2 rounded-lg cursor-pointer ${
                  isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                }`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <button 
                  className="mr-1 p-0.5 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(folder.id);
                  }}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <Folder size={16} className={`mr-2 ${isSelected ? 'text-primary' : ''}`} />
                <span className="text-sm font-medium truncate">{folder.name}</span>
              </div>
              
              {isExpanded && renderFolderTree(folder.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  // Handle document upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      
      setDocumentFormData({
        ...documentFormData,
        file,
        name: file.name.split('.')[0] // Set document name to file name by default
      });
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      
      setDocumentFormData({
        ...documentFormData,
        file,
        name: file.name.split('.')[0]
      });
    }
  };

  // Add tag to document
  const addTag = () => {
    if (!newTagInput.trim()) return;
    
    // Check if tag already exists
    if (documentFormData.tags.includes(newTagInput.trim())) {
      toast.info('Tag already added');
      return;
    }
    
    setDocumentFormData({
      ...documentFormData,
      tags: [...documentFormData.tags, newTagInput.trim()]
    });
    
    setNewTagInput('');
  };

  // Remove tag from document
  const removeTag = (tagToRemove) => {
    setDocumentFormData({
      ...documentFormData,
      tags: documentFormData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle document form submission
  const handleDocumentSubmit = (e) => {
    e.preventDefault();
    
    if (!documentFormData.file && !selectedDocument) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!documentFormData.name.trim()) {
      toast.error('Document name is required');
      return;
    }
    
    if (selectedDocument) {
      // Update existing document
      const updatedDoc = {
        ...selectedDocument,
        name: documentFormData.name,
        description: documentFormData.description,
        folderId: documentFormData.folderId,
        tags: documentFormData.tags,
        clientId: documentFormData.clientId,
        projectId: documentFormData.projectId,
        access: documentFormData.access,
        encrypted: documentFormData.encrypted,
        lastModified: new Date().toISOString()
      };
      
      if (documentFormData.file) {
        // If a new file was uploaded, create a new version
        const newVersion = {
          id: Date.now().toString(),
          documentId: selectedDocument.id,
          filename: documentFormData.file.name,
          uploadedAt: new Date().toISOString(),
          size: documentFormData.file.size,
          uploader: 'Current User', // In a real app, use the actual user name
          notes: 'Updated version'
        };
        
        updatedDoc.versions = [...(selectedDocument.versions || []), newVersion];
        updatedDoc.currentVersion = newVersion.id;
      }
      
      // Dispatch update action
      dispatch({ type: 'UPDATE_DOCUMENT', payload: updatedDoc });
      toast.success('Document updated successfully');
    } else {
      // Create new document
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: documentFormData.name,
        description: documentFormData.description,
        folderId: documentFormData.folderId,
        tags: documentFormData.tags,
        clientId: documentFormData.clientId,
        projectId: documentFormData.projectId,
        file: documentFormData.file, // In a real app, this would be a URL after upload
        fileType: documentFormData.file.type,
        fileName: documentFormData.file.name,
        size: documentFormData.file.size,
        access: documentFormData.access,
        encrypted: documentFormData.encrypted,
        uploaded: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        type: documentFormData.fileName?.toLowerCase().includes('contract') ? 'contract' : 
              documentFormData.fileName?.toLowerCase().includes('proposal') ? 'proposal' : 'document',
        versions: [{
          id: `ver-${Date.now()}`,
          documentId: `doc-${Date.now()}`,
          filename: documentFormData.file.name,
          uploadedAt: new Date().toISOString(),
          size: documentFormData.file.size,
          uploader: 'Current User', // In a real app, use the actual user name
          notes: 'Initial version'
        }]
      };
      
      newDoc.currentVersion = newDoc.versions[0].id;
      
      // Dispatch add action
      dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
      toast.success('Document uploaded successfully');
    }
    
    // Reset form and close modal
    setDocumentFormData({
      id: '',
      name: '',
      description: '',
      folderId: selectedFolder,
      tags: [],
      clientId: '',
      projectId: '',
      file: null,
      access: 'private',
      encrypted: false
    });
    setShowAddDocumentModal(false);
    setSelectedDocument(null);
  };

  // Handle folder creation
  const handleAddFolder = (e) => {
    e.preventDefault();
    
    if (!newFolderData.name.trim()) {
      toast.error('Folder name is required');
      return;
    }
    
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderData.name,
      parentId: newFolderData.parentId,
      created: new Date().toISOString()
    };
    
    // Dispatch add folder action
    dispatch({ type: 'ADD_FOLDER', payload: newFolder });
    toast.success('Folder created successfully');
    
    // Reset form and close modal
    setNewFolderData({
      name: '',
      parentId: selectedFolder
    });
    setShowAddFolderModal(false);
    
    // Expand the parent folder
    if (!expandedFolders.includes(newFolderData.parentId)) {
      setExpandedFolders([...expandedFolders, newFolderData.parentId]);
    }
  };

  // Edit document
  const handleEditDocument = (document) => {
    setSelectedDocument(document);
    setDocumentFormData({
      id: document.id,
      name: document.name,
      description: document.description || '',
      folderId: document.folderId,
      tags: document.tags || [],
      clientId: document.clientId || '',
      projectId: document.projectId || '',
      file: null, // No file initially when editing
      access: document.access || 'private',
      encrypted: document.encrypted || false
    });
    setShowAddDocumentModal(true);
  };

  // Delete document
  const confirmDeleteDocument = (document) => {
    setDocumentToDelete(document);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteDocument = () => {
    if (!documentToDelete) return;
    
    // Dispatch delete action
    dispatch({ type: 'DELETE_DOCUMENT', payload: documentToDelete.id });
    toast.success('Document deleted successfully');
    
    setShowDeleteConfirm(false);
    setDocumentToDelete(null);
  };

  // View document version history
  const viewVersionHistory = (document) => {
    setSelectedDocument(document);
    setShowVersionHistoryModal(true);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get client name
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'N/A';
  };

  // Get project name
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'N/A';
  };

  // Get folder path
  const getFolderPath = (folderId) => {
    if (folderId === 'root' || !folderId) return 'Root';
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return 'Unknown';
    
    if (folder.parentId === 'root') return folder.name;
    
    const parentFolder = folders.find(f => f.id === folder.parentId);
    return parentFolder ? `${parentFolder.name} / ${folder.name}` : folder.name;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-primary" size={28} />
            Documents
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Securely store, organize and share your important documents
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setShowAddFolderModal(true)}
            className="btn btn-outline flex items-center gap-2"
          >
            <Folder size={18} />
            New Folder
          </button>
          
          <button 
            onClick={() => {
              setSelectedDocument(null);
              setDocumentFormData({
                ...documentFormData,
                folderId: selectedFolder
              });
              setShowAddDocumentModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Upload size={18} />
            Upload Document
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="card p-4">
            <h3 className="font-semibold mb-3 flex justify-between items-center">
              <span>Folders</span>
              <button 
                onClick={() => setShowAddFolderModal(true)}
                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-full"
                title="Add Folder"
              >
                <PlusCircle size={16} />
              </button>
            </h3>
            
            <div>
              <div 
                className={`flex items-center py-1 px-2 rounded-lg cursor-pointer mb-2 ${
                  selectedFolder === 'root' ? 'bg-primary/10 text-primary' : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                }`}
                onClick={() => setSelectedFolder('root')}
              >
                <Folder size={16} className={`mr-2 ${selectedFolder === 'root' ? 'text-primary' : ''}`} />
                <span className="text-sm font-medium">All Documents</span>
              </div>
              
              {renderFolderTree()}
            </div>
            
            <h3 className="font-semibold mt-6 mb-3">Tags</h3>
            <div className="space-y-1">
              <div 
                className={`flex items-center py-1 px-2 rounded-lg cursor-pointer ${
                  !selectedTag ? 'bg-primary/10 text-primary' : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                }`}
                onClick={() => setSelectedTag('')}
              >
                <Tag size={16} className="mr-2" />
                <span className="text-sm font-medium">All Tags</span>
              </div>
              
              {tags.map(tag => (
                <div 
                  key={tag}
                  className={`flex items-center py-1 px-2 rounded-lg cursor-pointer ${
                    selectedTag === tag ? 'bg-primary/10 text-primary' : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                  }`}
                  onClick={() => setSelectedTag(tag)}
                >
                  <Tag size={16} className="mr-2" />
                  <span className="text-sm font-medium">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                All Documents
              </button>
              <button
                className={`pb-4 px-1 font-medium ${
                  activeTab === 'contracts' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary'
                }`}
                onClick={() => setActiveTab('contracts')}
              >
                Contracts
              </button>
              <button
                className={`pb-4 px-1 font-medium ${
                  activeTab === 'proposals' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary'
                }`}
                onClick={() => setActiveTab('proposals')}
              >
                Proposals
              </button>
              <button
                className={`pb-4 px-1 font-medium ${
                  activeTab === 'shared' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary'
                }`}
                onClick={() => setActiveTab('shared')}
              >
                Shared
              </button>
              <button
                className={`pb-4 px-1 font-medium ${
                  activeTab === 'secured' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary'
                }`}
                onClick={() => setActiveTab('secured')}
              >
                Secured
              </button>
            </div>
          </div>
          
          {/* Document Grid */}
          <div className="mt-6">
            {filteredDocuments.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-12">
                <FileText size={48} className="text-surface-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No documents found</h3>
                <p className="text-surface-500 dark:text-surface-400 mb-6">
                  {selectedFolder !== 'root' 
                    ? "This folder is empty" 
                    : searchQuery
                      ? `No results found for "${searchQuery}"`
                      : "Upload your first document to get started"}
                </p>
                <button
                  onClick={() => {
                    setSelectedDocument(null);
                    setDocumentFormData({
                      ...documentFormData,
                      folderId: selectedFolder
                    });
                    setShowAddDocumentModal(true);
                  }}
                  className="btn btn-primary"
                >
                  <Upload size={18} className="mr-2" />
                  Upload Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(document => (
                  <div 
                    key={document.id} 
                    className="card hover:shadow-lg transition-shadow"
                    onMouseEnter={() => setHoveredDocument(document.id)}
                    onMouseLeave={() => setHoveredDocument(null)}
                  >
                    <div className="p-4 flex items-center">
                      <div className="w-12 h-12 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                        <FileText size={24} className="text-primary" />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="font-medium text-lg truncate" title={document.name}>
                          {document.name}
                        </h3>
                        <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
                          {formatFileSize(document.size)} · {formatDate(document.lastModified)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Document info */}
                    <div className="px-4 py-2 border-t border-surface-200 dark:border-surface-700">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {document.tags && document.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                        
                        {document.access === 'shared' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <Share size={12} className="mr-1" />
                            Shared
                          </span>
                        )}
                        
                        {document.encrypted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <Lock size={12} className="mr-1" />
                            Encrypted
                          </span>
                        )}
                      </div>
                      
                      {(document.clientId || document.projectId) && (
                        <div className="text-xs text-surface-500 dark:text-surface-400 mb-3">
                          {document.clientId && (
                            <div className="flex items-center">
                              <Users size={12} className="mr-1" />
                              Client: {getClientName(document.clientId)}
                            </div>
                          )}
                          
                          {document.projectId && (
                            <div className="flex items-center mt-1">
                              <Briefcase size={12} className="mr-1" />
                              Project: {getProjectName(document.projectId)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="px-4 py-2 border-t border-surface-200 dark:border-surface-700 flex justify-between">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toast.info('Document preview opened')}
                          className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
                          title="View Document"
                        >
                          <Eye size={18} />
                        </button>
                        
                        <button 
                          onClick={() => toast.success('Document downloaded')}
                          className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        
                        <button 
                          onClick={() => viewVersionHistory(document)}
                          className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
                          title="Version History"
                        >
                          <Clock size={18} />
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditDocument(document)}
                          className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        
                        <button 
                          onClick={() => confirmDeleteDocument(document)}
                          className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Upload Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-surface-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-surface-800 px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedDocument ? 'Edit Document' : 'Upload Document'}
              </h2>
              <button 
                onClick={() => setShowAddDocumentModal(false)}
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} className="p-6">
              {/* File Upload Zone */}
              {!selectedDocument && (
                <div 
                  className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-6 text-center mb-6"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {documentFormData.file ? (
                    <div className="flex items-center justify-center flex-col">
                      <CheckCircle size={40} className="text-green-500 mb-2" />
                      <p className="font-medium">{documentFormData.file.name}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {formatFileSize(documentFormData.file.size)}
                      </p>
                      <button 
                        type="button"
                        onClick={() => setDocumentFormData({...documentFormData, file: null})}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={40} className="mx-auto text-surface-400 mb-2" />
                      <p className="text-surface-600 dark:text-surface-400 mb-2">
                        Drag & drop your file here, or <button 
                          type="button" 
                          className="text-primary hover:underline"
                          onClick={() => fileInputRef.current?.click()}
                        >browse</button>
                      </p>
                      <p className="text-xs text-surface-500">
                        Supported formats: PDF, DOCX, XLSX, JPG, PNG, etc. (Max 10MB)
                      </p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              )}
              
              {/* Document Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="form-label">Document Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={documentFormData.name}
                    onChange={(e) => setDocumentFormData({...documentFormData, name: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    value={documentFormData.description}
                    onChange={(e) => setDocumentFormData({...documentFormData, description: e.target.value})}
                    className="input"
                    rows={3}
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="folder" className="form-label">Folder</label>
                  <select
                    id="folder"
                    value={documentFormData.folderId}
                    onChange={(e) => setDocumentFormData({...documentFormData, folderId: e.target.value})}
                    className="select"
                  >
                    <option value="root">Root</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>
                        {getFolderPath(folder.id)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="access" className="form-label">Access Level</label>
                  <select
                    id="access"
                    value={documentFormData.access}
                    onChange={(e) => setDocumentFormData({...documentFormData, access: e.target.value})}
                    className="select"
                  >
                    <option value="private">Private</option>
                    <option value="shared">Shared</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="client" className="form-label">Associated Client</label>
                  <select
                    id="client"
                    value={documentFormData.clientId}
                    onChange={(e) => setDocumentFormData({...documentFormData, clientId: e.target.value})}
                    className="select"
                  >
                    <option value="">None</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="project" className="form-label">Associated Project</label>
                  <select
                    id="project"
                    value={documentFormData.projectId}
                    onChange={(e) => setDocumentFormData({...documentFormData, projectId: e.target.value})}
                    className="select"
                    disabled={!documentFormData.clientId}
                  >
                    <option value="">None</option>
                    {projects
                      .filter(project => !documentFormData.clientId || project.clientId === documentFormData.clientId)
                      .map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label mb-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={documentFormData.encrypted}
                      onChange={(e) => setDocumentFormData({...documentFormData, encrypted: e.target.checked})}
                      className="mr-2"
                    />
                    <span>Enable encryption for this document</span>
                    <div className="ml-2 text-surface-500 dark:text-surface-400">
                      <Shield size={16} />
                    </div>
                  </label>
                  {documentFormData.encrypted && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                      <AlertTriangle size={12} className="inline mr-1 text-amber-500" />
                      Encrypted documents require password access and may have limited preview capabilities.
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {documentFormData.tags.map(tag => (
                      <div 
                        key={tag} 
                        className="bg-surface-100 dark:bg-surface-700 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <span>{tag}</span>
                        <button 
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="input mr-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={addTag}
                      className="btn btn-primary"
                      disabled={!newTagInput.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddDocumentModal(false)}
                  className="btn border border-surface-300 dark:border-surface-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {selectedDocument ? 'Update Document' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-surface-800 rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Create New Folder</h2>
              <button 
                onClick={() => setShowAddFolderModal(false)}
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFolder} className="p-6">
              <div className="mb-4">
                <label htmlFor="folderName" className="form-label">Folder Name *</label>
                <input
                  type="text"
                  id="folderName"
                  value={newFolderData.name}
                  onChange={(e) => setNewFolderData({...newFolderData, name: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="parentFolder" className="form-label">Parent Folder</label>
                <select
                  id="parentFolder"
                  value={newFolderData.parentId}
                  onChange={(e) => setNewFolderData({...newFolderData, parentId: e.target.value})}
                  className="select"
                >
                  <option value="root">Root</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {getFolderPath(folder.id)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddFolderModal(false)}
                  className="btn border border-surface-300 dark:border-surface-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Version History Modal */}
      {showVersionHistoryModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-surface-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Version History</h2>
              <button 
                onClick={() => setShowVersionHistoryModal(false)}
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-medium text-lg mb-4">{selectedDocument.name}</h3>
              
              <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                  <thead className="bg-surface-50 dark:bg-surface-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Version</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Uploader</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                    {selectedDocument.versions?.map((version, index) => {
                      const isCurrent = version.id === selectedDocument.currentVersion;
                      
                      return (
                        <tr key={version.id} className={isCurrent ? 'bg-primary/5' : ''}>
                          <td className="px-4 py-3 text-sm font-medium">
                            {isCurrent ? (
                              <span className="flex items-center">
                                v{selectedDocument.versions.length - index}
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                  Current
                                </span>
                              </span>
                            ) : (
                              `v${selectedDocument.versions.length - index}`
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatDate(version.uploadedAt)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatFileSize(version.size)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {version.uploader}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  toast.success('Document downloaded');
                                  setShowVersionHistoryModal(false);
                                }}
                                className="text-primary hover:text-primary-dark"
                              >
                                <Download size={16} />
                              </button>
                              
                              {!isCurrent && (
                                <button
                                  onClick={() => {
                                    // Set as current version
                                    const updatedDoc = {
                                      ...selectedDocument,
                                      currentVersion: version.id
                                    };
                                    dispatch({ type: 'UPDATE_DOCUMENT', payload: updatedDoc });
                                    toast.success('Restored to this version');
                                    setSelectedDocument(updatedDoc);
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                  title="Restore this version"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVersionHistoryModal(false)}
                  className="btn bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-xl max-w-md w-full shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn border border-surface-300 dark:border-surface-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDocument}
                className="btn bg-red-500 hover:bg-red-600 text-white"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
