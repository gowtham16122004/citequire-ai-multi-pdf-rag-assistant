import React, { useState } from 'react';
import { FileText, X, BookOpen, Quote } from 'lucide-react';

export const SourceCard = ({ citation, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        type="button"
        className="citation-chip" 
        onClick={() => setIsOpen(true)}
        title={`View context excerpt from ${citation.source} (Page ${citation.page})`}
        aria-label={`View context excerpt from ${citation.source} (Page ${citation.page})`}
      >
        <span className="citation-num">[{index || 1}]</span>
        <span className="citation-filename">{citation.source}</span>
        <span className="citation-divider">&bull;</span>
        <span className="citation-page">p.{citation.page}</span>
      </button>

      {isOpen && (
        <div className="snippet-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="snippet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="snippet-modal-header">
              <div className="snippet-title-group">
                <BookOpen size={16} className="snippet-header-icon" />
                <span className="snippet-title">{citation.source}</span>
                <span className="snippet-page-tag">Page {citation.page}</span>
              </div>
              <button 
                type="button"
                className="btn-icon" 
                onClick={() => setIsOpen(false)}
                title="Close excerpt preview"
                aria-label="Close excerpt preview"
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="snippet-label-row">
              <Quote size={12} />
              <span>Verified PDF Chunk Excerpt</span>
            </div>

            <div className="snippet-body">
              {citation.snippet}
            </div>

            <div className="snippet-modal-footer">
              <button 
                type="button"
                className="btn-secondary btn-sm" 
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
