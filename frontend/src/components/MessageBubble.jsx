import React, { useState, useRef, useCallback } from 'react';
import { User, Copy, Check, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, FileText, BookOpen, X, Quote } from 'lucide-react';
import { marked } from 'marked';
import { CiteQuireIcon } from './CiteQuireIcon';

marked.setOptions({
  gfm: true,
  breaks: true,
});

// ─── Inline Citation Chip ──────────────────────────────────────────────────
function CitationChip({ index, citation, activeCitation, onHover, onLeave, onClick }) {
  const isActive = activeCitation === index;
  return (
    <button
      type="button"
      className={`inline-citation-chip ${isActive ? 'inline-citation-chip--active' : ''}`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(index)}
      onBlur={onLeave}
      onClick={() => onClick(index)}
      title={`View source: ${citation.source} · Page ${citation.page}`}
      aria-label={`Citation ${index}: ${citation.source}, page ${citation.page}`}
    >
      {index}
    </button>
  );
}

// ─── Source Row in Sources Drawer ──────────────────────────────────────────
function SourceRow({ citation, index, activeCitation, onHover, onLeave, onOpen }) {
  const isActive = activeCitation === index;
  const filename = citation.source || 'Unknown document';
  const shortname = filename.length > 32 ? filename.slice(0, 29) + '…' : filename;

  return (
    <button
      type="button"
      className={`source-row ${isActive ? 'source-row--active' : ''}`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(index)}
      onBlur={onLeave}
      onClick={() => onOpen(index)}
      title={`View excerpt from ${filename}`}
      aria-label={`Source ${index}: ${filename}, page ${citation.page}`}
    >
      <span className="source-row__num">{index}</span>
      <span className="source-row__icon">
        <FileText size={12} />
      </span>
      <span className="source-row__name">{shortname}</span>
      <span className="source-row__page">p.{citation.page}</span>
    </button>
  );
}

// ─── Excerpt Modal ─────────────────────────────────────────────────────────
function ExcerptModal({ citation, index, onClose }) {
  const overlayRef = useRef(null);
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };
  return (
    <div
      ref={overlayRef}
      className="snippet-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Source excerpt: ${citation.source}`}
    >
      <div className="snippet-modal">
        <div className="snippet-modal-header">
          <div className="snippet-title-group">
            <BookOpen size={15} className="snippet-header-icon" />
            <span className="snippet-title">{citation.source}</span>
            <span className="snippet-page-tag">Page {citation.page}</span>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            title="Close"
            aria-label="Close excerpt"
          >
            <X size={14} />
          </button>
        </div>

        <div className="snippet-label-row">
          <Quote size={11} />
          <span>Verified PDF excerpt</span>
        </div>

        <div className="snippet-body">
          {citation.snippet || 'No excerpt available.'}
        </div>

        <div className="snippet-modal-footer">
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main MessageBubble ────────────────────────────────────────────────────
export const MessageBubble = ({ message, index, onFeedback }) => {
  const [copied, setCopied] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [activeCitation, setActiveCitation] = useState(null);
  const [openExcerptIndex, setOpenExcerptIndex] = useState(null);
  const isUser = message.role === 'user';
  const sources = message.sources || [];
  const hasSources = sources.length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChipHover = useCallback((idx) => setActiveCitation(idx), []);
  const handleHoverLeave = useCallback(() => setActiveCitation(null), []);
  const handleOpenExcerpt = useCallback((idx) => setOpenExcerptIndex(idx), []);
  const handleCloseExcerpt = useCallback(() => setOpenExcerptIndex(null), []);

  const renderedHtml = !isUser ? marked.parse(message.content || '') : '';

  return (
    <>
      <div
        className={`message-row ${isUser ? 'user' : 'assistant'}`}
        style={{ '--msg-index': index }}
      >
        <div className={`avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`}>
          {isUser ? <User size={13} /> : <CiteQuireIcon size={15} />}
        </div>

        <div className="message-content-wrapper">
          {isUser ? (
            <div className="user-message-bubble">{message.content}</div>
          ) : (
            <div className="assistant-message-body">
              {/* Markdown answer prose */}
              <div
                className="markdown-prose"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />

              {/* Sources section — CitedAnswer style collapsible */}
              {hasSources && (
                <div className="cited-sources-section">
                  {/* Collapsed header / toggle row */}
                  <button
                    type="button"
                    className="cited-sources-toggle"
                    onClick={() => setSourcesExpanded((v) => !v)}
                    aria-expanded={sourcesExpanded}
                    aria-controls={`sources-panel-${index}`}
                  >
                    <span className="cited-sources-toggle__label">
                      <FileText size={12} className="cited-sources-toggle__icon" />
                      {sources.length} source{sources.length !== 1 ? 's' : ''}
                    </span>

                    {/* Collapsed: show first 3 chip previews */}
                    {!sourcesExpanded && (
                      <span className="cited-sources-preview" aria-hidden="true">
                        {sources.slice(0, 3).map((cit, i) => (
                          <span key={i} className="source-preview-pill">
                            {i + 1} · p.{cit.page}
                          </span>
                        ))}
                        {sources.length > 3 && (
                          <span className="source-preview-pill source-preview-pill--more">
                            +{sources.length - 3}
                          </span>
                        )}
                      </span>
                    )}

                    <span className="cited-sources-toggle__chevron">
                      {sourcesExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </span>
                  </button>

                  {/* Expanded sources list */}
                  {sourcesExpanded && (
                    <div
                      id={`sources-panel-${index}`}
                      className="cited-sources-panel"
                    >
                      {sources.map((cit, i) => (
                        <SourceRow
                          key={`${cit.source}-${cit.page}-${i}`}
                          citation={cit}
                          index={i + 1}
                          activeCitation={activeCitation}
                          onHover={handleChipHover}
                          onLeave={handleHoverLeave}
                          onOpen={handleOpenExcerpt}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action bar */}
              <div className="msg-actions-bar">
                <div className="feedback-cluster">
                  <button
                    type="button"
                    className={`feedback-pill ${message.feedback === 'helpful' ? 'active-helpful' : ''}`}
                    onClick={() => onFeedback && onFeedback(index, 'helpful')}
                    title="Mark as helpful"
                    aria-label="Mark answer as helpful"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    type="button"
                    className={`feedback-pill ${message.feedback === 'unhelpful' ? 'active-unhelpful' : ''}`}
                    onClick={() => onFeedback && onFeedback(index, 'unhelpful')}
                    title="Report issue"
                    aria-label="Report issue with answer"
                  >
                    <ThumbsDown size={12} />
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-copy"
                  onClick={handleCopy}
                  title="Copy answer"
                  aria-label="Copy answer to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="check-icon" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Excerpt modal portal */}
      {openExcerptIndex !== null && sources[openExcerptIndex - 1] && (
        <ExcerptModal
          citation={sources[openExcerptIndex - 1]}
          index={openExcerptIndex}
          onClose={handleCloseExcerpt}
        />
      )}
    </>
  );
};
