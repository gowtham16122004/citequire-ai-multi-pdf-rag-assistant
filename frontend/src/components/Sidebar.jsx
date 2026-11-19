import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Search, 
  X, 
  PanelLeftClose,
  FolderOpen,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { CiteQuireIcon } from './CiteQuireIcon';
import { FileUpload } from './FileUpload';

export const Sidebar = ({ 
  isOpen, 
  isCollapsed,
  onClose, 
  onToggleCollapse,
  systemStatus, 
  onUploadSuccess, 
  onDeleteDocument, 
  onWipeAll 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const documents = systemStatus?.documents || [];
  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const hasDocuments = documents.length > 0;
  const hasKeys = systemStatus?.has_google_key && systemStatus?.has_groq_key;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="mobile-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <CiteQuireIcon size={22} />
            <div className="brand-info">
              <span className="brand-name">CiteQuire</span>
              <span className="brand-badge">PDF RAG</span>
            </div>
          </div>

          {/* Desktop collapse button */}
          <button 
            type="button" 
            className="btn-icon desktop-only" 
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </button>

          {/* Mobile close button */}
          <button 
            type="button" 
            className="btn-icon mobile-only" 
            onClick={onClose} 
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sidebar-body">
          {/* Upload Component */}
          <FileUpload 
            onUploadSuccess={onUploadSuccess} 
            systemStatus={systemStatus} 
          />

          {/* Documents Section */}
          <div className="sidebar-section">
            <div className="section-header">
              <span className="section-title">Documents</span>
              <span className="section-count">{documents.length}</span>
            </div>

            {hasDocuments && (
              <div className="doc-search-bar">
                <Search size={13} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter documents"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear filter"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Active Documents List */}
            <div className="document-list">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <div key={doc.filename} className="doc-item">
                    <div className="doc-item-main">
                      <div className="doc-status-dot" title="Indexed in vector store" />
                      <div className="doc-item-details">
                        <span className="doc-item-name" title={doc.filename}>
                          {doc.filename}
                        </span>
                        <div className="doc-item-meta">
                          <span>{doc.pages} pg</span>
                          <span>&bull;</span>
                          <span>{doc.chunks} chk</span>
                          <span>&bull;</span>
                          <span>{formatFileSize(doc.size_bytes)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="doc-delete-btn"
                      onClick={() => onDeleteDocument(doc.filename)}
                      title={`Remove '${doc.filename}'`}
                      aria-label={`Remove '${doc.filename}'`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : hasDocuments && searchQuery ? (
                <div className="empty-subtext">No documents match filter</div>
              ) : (
                <div className="sidebar-empty-state">
                  <FolderOpen size={20} className="empty-icon" />
                  <span>No PDFs uploaded yet</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Consolidated Status & Knowledge Control */}
        <div className="sidebar-footer">
          {!hasKeys ? (
            <div className="sidebar-warning-banner">
              <AlertTriangle size={13} />
              <span>API keys needed in backend/.env</span>
            </div>
          ) : (
            <div className="sidebar-status-line">
              <span className="status-dot online"></span>
              <span className="status-text">
                {documents.length} doc{documents.length === 1 ? '' : 's'} &bull; {systemStatus?.total_chunks || 0} chunks indexed
              </span>
            </div>
          )}

          {hasDocuments && (
            <button
              type="button"
              className="btn-wipe"
              onClick={onWipeAll}
              title="Reset all documents and vector index"
            >
              <RotateCcw size={11} />
              <span>Reset Knowledge Base</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
