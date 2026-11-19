import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, FileCheck, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ICON_TRANSFORMS = [
  {
    idle: 'translate(-78%, -50%) rotate(-8deg)',
    active: 'translate(-114%, -50%) rotate(-12deg) scale(1.08)',
  },
  {
    idle: 'translate(-50%, -50%) rotate(0deg)',
    active: 'translate(-50%, -50%) rotate(0deg) scale(1.18)',
  },
  {
    idle: 'translate(-22%, -50%) rotate(8deg)',
    active: 'translate(14%, -50%) rotate(12deg) scale(1.08)',
  },
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function UploadIconCluster({ isDragging }) {
  const icons = [
    { label: 'Doc', icon: FileText },
    { label: 'PDF', icon: FileCheck },
    { label: 'Data', icon: FileSpreadsheet },
  ];

  return (
    <div className="upload-icon-cluster">
      {icons.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.label}
            className={`cluster-card cluster-card-${index} ${index === 1 ? 'z-center' : ''} ${isDragging ? 'is-dragging' : ''}`}
            style={{
              transform: isDragging
                ? ICON_TRANSFORMS[index]?.active
                : ICON_TRANSFORMS[index]?.idle,
            }}
          >
            <IconComponent size={17} />
          </div>
        );
      })}
    </div>
  );
}

export const FileUpload = ({ onUploadSuccess, systemStatus }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const dragDepthRef = useRef(0);
  const fileInputRef = useRef(null);

  const handleFileSelection = useCallback((newFiles) => {
    setErrorMessage(null);
    setStatusMessage(null);
    const filesArray = Array.from(newFiles);

    // Validate .pdf extension (Strict CiteQuire Backend Constraint)
    const validPdfs = filesArray.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    if (validPdfs.length < filesArray.length) {
      setErrorMessage('Non-PDF files omitted. CiteQuire only processes .pdf documents.');
    }

    // Validate size limit (50MB)
    const oversized = validPdfs.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setErrorMessage(`Oversized files omitted (50MB max): ${oversized.map((f) => f.name).join(', ')}`);
    }

    const eligible = validPdfs.filter((f) => f.size <= MAX_FILE_SIZE);

    // Deduplicate by filename
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((p) => p.name));
      const additions = eligible.filter((f) => !existingNames.has(f.name));
      return [...prev, ...additions];
    });
  }, []);

  const removeFile = (nameToRemove) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== nameToRemove));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAndProcess = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await apiService.uploadPDFs(selectedFiles);
      setStatusMessage(res.message);
      setSelectedFiles([]);
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error processing PDFs');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="reference-upload-wrapper">
      {/* Outer BorderBeam Box */}
      <div className={`beam-container ${isDragging ? 'beam-active' : ''}`}>
        <div
          role="button"
          tabIndex={0}
          className={`reference-dropzone ${isDragging ? 'is-dragging' : ''}`}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFileDialog();
            }
          }}
          aria-label="Upload PDF documents"
        >
          {/* Centered Stacked File Icon Cluster with Dynamic Transforms */}
          <UploadIconCluster isDragging={isDragging} />

          {/* Centered Instructions */}
          <div className="dropzone-text-block">
            <span className="dropzone-title">Click to upload or drop files</span>
            <span className="dropzone-description">PDF documents (up to 50MB)</span>
          </div>

          {/* Small Pill-Shaped Browse Files Button */}
          <div className="browse-pill-button">
            <Upload size={12} className="browse-pill-icon" />
            <span>{isDragging ? 'Drop to add' : 'Browse files'}</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) {
                handleFileSelection(e.target.files);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Staged File List (Reference Style) */}
      {selectedFiles.length > 0 && (
        <div className="staged-files-panel">
          <div className="staged-header">
            <span>Staged ({selectedFiles.length})</span>
            <button
              type="button"
              className="staged-clear-btn"
              onClick={() => setSelectedFiles([])}
            >
              Clear
            </button>
          </div>

          <div className="staged-list">
            {selectedFiles.map((file) => (
              <div key={file.name} className="staged-row">
                <div className="staged-thumb">
                  <FileText size={15} />
                </div>
                <div className="staged-info">
                  <span className="staged-name" title={file.name}>
                    {file.name}
                  </span>
                  <span className="staged-meta">
                    PDF &bull; {formatBytes(file.size)}
                  </span>
                </div>
                <div className="staged-badge">Ready</div>
                <button
                  type="button"
                  className="staged-remove-btn"
                  onClick={() => removeFile(file.name)}
                  title="Remove file"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Process PDFs Action Button */}
          <button
            type="button"
            className="btn-primary btn-process-pdfs"
            onClick={handleUploadAndProcess}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="spinner" />
                <span>Indexing {selectedFiles.length} PDF{selectedFiles.length > 1 ? 's' : ''}...</span>
              </>
            ) : (
              <span>Process {selectedFiles.length} Document{selectedFiles.length > 1 ? 's' : ''}</span>
            )}
          </button>
        </div>
      )}

      {/* Success Notification */}
      {statusMessage && (
        <div className="upload-alert success">
          <CheckCircle2 size={13} className="alert-icon" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="upload-alert error">
          <AlertCircle size={13} className="alert-icon" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
