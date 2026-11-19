import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowUp, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  GraduationCap, 
  GitCompare, 
  Paperclip, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { CiteQuireIcon } from './CiteQuireIcon';
import { MessageBubble } from './MessageBubble';

// ─── Clean Document Title Helper ───────────────────────────────────────────
function cleanDocTitle(filename) {
  if (!filename) return 'the document';
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

// ─── Reading Sources Indicator (Indeterminate, No Fake Numbers) ─────────────
function ReadingSourcesIndicator() {
  return (
    <div className="reading-indicator" role="status" aria-live="polite" aria-label="CiteQuire is reading your documents">
      <div className="reading-indicator__avatar">
        <CiteQuireIcon size={14} />
      </div>
      <div className="reading-indicator__body">
        <div className="reading-indicator__label">
          <span className="reading-indicator__dot" aria-hidden="true" />
          <span className="reading-indicator__dot" aria-hidden="true" />
          <span className="reading-indicator__dot" aria-hidden="true" />
          <span className="reading-indicator__text">Reading sources</span>
        </div>
        <div className="reading-indicator__bars" aria-hidden="true">
          <div className="reading-bar reading-bar--a" />
          <div className="reading-bar reading-bar--b" />
          <div className="reading-bar reading-bar--c" />
        </div>
      </div>
    </div>
  );
}

// ─── Premium AI Chat Composer Form ─────────────────────────────────────────
function ComposerForm({
  input,
  setInput,
  onSubmit,
  isLoading,
  disabled,
  hasDocuments,
  docCount,
  onOpenUpload,
  placeholder,
  isWelcomeScreen = false,
}) {
  const textareaRef = useRef(null);
  const canSend = input.trim().length > 0 && !isLoading && !disabled;

  const handleKeyDown = (e) => {
    if (e.isComposing || e.nativeEvent?.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSubmit();
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, isWelcomeScreen ? 180 : 140)}px`;
    }
  }, [input, isWelcomeScreen]);

  return (
    <form
      className={`premium-composer ${isWelcomeScreen ? 'premium-composer--hero' : 'premium-composer--bottom'}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) {
          onSubmit();
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        }
      }}
      noValidate
    >
      {/* Top Area: Multiline Text Input */}
      <div className="composer-input-area">
        <textarea
          ref={textareaRef}
          rows={isWelcomeScreen ? 2 : 1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (disabled
              ? 'Upload PDF documents in the sidebar to begin…'
              : 'Ask anything about your documents…')
          }
          disabled={disabled || isLoading}
          className="composer-textarea"
          aria-label="Ask anything about your documents"
        />
      </div>

      {/* Bottom Toolbar: Context Indicator, Upload/Attach, Send Button */}
      <div className="composer-bottom-toolbar">
        <div className="composer-toolbar-left">
          {hasDocuments ? (
            <div className="composer-doc-status" title={`${docCount} document(s) indexed in knowledge base`}>
              <span className="doc-status-dot ready"></span>
              <span className="doc-status-text">{docCount} {docCount === 1 ? 'document' : 'documents'} ready</span>
            </div>
          ) : (
            <button
              type="button"
              className="composer-doc-status action-needed"
              onClick={onOpenUpload}
              title="Upload PDFs in sidebar"
            >
              <UploadCloud size={13} />
              <span className="doc-status-text">Upload PDF in sidebar</span>
            </button>
          )}

          {onOpenUpload && (
            <button
              type="button"
              className="composer-toolbar-btn"
              onClick={onOpenUpload}
              title="Add or manage PDF documents"
              aria-label="Add or manage PDF documents"
            >
              <Paperclip size={14} />
            </button>
          )}
        </div>

        <div className="composer-toolbar-right">
          <span className="composer-hint-key desktop-only">
            {canSend ? 'Press Enter ↵' : ''}
          </span>
          <button
            type="submit"
            className={`composer-send-btn ${canSend ? 'is-active' : ''}`}
            disabled={!canSend}
            title={canSend ? 'Send query (Enter)' : 'Type a question first'}
            aria-label="Send query"
          >
            <ArrowUp size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Main CitedAnswerChatInput Component ───────────────────────────────────
export const CitedAnswerChatInput = ({
  messages = [],
  isLoading = false,
  onSendMessage,
  onFeedback,
  hasDocuments = false,
  systemStatus = null,
  documents = [],
  onOpenUpload,
  placeholder,
}) => {
  const [input, setInput] = useState('');
  const scrollEndRef = useRef(null);

  const docCount = systemStatus?.total_documents ?? documents.length ?? (hasDocuments ? 1 : 0);
  const totalChunks = systemStatus?.total_chunks ?? 0;
  const indexedFiles = systemStatus?.indexed_files ?? [];
  const primaryDocName = indexedFiles[0] || (documents[0]?.filename ?? null);
  const primaryDocTitle = cleanDocTitle(primaryDocName);

  // Generate contextual quick inquiries based on real uploaded documents
  const contextualPrompts = useMemo(() => {
    if (!hasDocuments) return [];
    const list = [];
    if (primaryDocTitle && primaryDocTitle !== 'the document') {
      list.push(`Summarize ${primaryDocTitle}`);
      list.push(`What are the key takeaways from ${primaryDocTitle}?`);
      list.push(`Explain the core topics and methodologies in ${primaryDocTitle}`);
    } else {
      list.push('Summarize the primary takeaways across all documents');
      list.push('What are the core arguments and conclusions cited?');
      list.push('Explain any specific laws, formulas, or theorems cited');
    }
    if (docCount >= 2) {
      list.push('Compare the main conclusions between these documents');
    }
    return list.slice(0, 4);
  }, [hasDocuments, primaryDocTitle, docCount]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !hasDocuments) return;
    onSendMessage(trimmed);
    setInput('');
  }, [input, isLoading, hasDocuments, onSendMessage]);

  const handleCardAction = useCallback((actionType) => {
    if (!hasDocuments) {
      if (onOpenUpload) onOpenUpload();
      return;
    }

    if (actionType === 'summarize') {
      if (primaryDocTitle && primaryDocTitle !== 'the document') {
        onSendMessage(`Summarize the key findings, conclusions, and core arguments from ${primaryDocTitle}.`);
      } else {
        onSendMessage('Summarize the key findings, conclusions, and core arguments across the uploaded documents.');
      }
    } else if (actionType === 'understand') {
      if (primaryDocTitle && primaryDocTitle !== 'the document') {
        onSendMessage(`Break down the most complex concepts and methodologies in ${primaryDocTitle} into clear explanations.`);
      } else {
        onSendMessage('Break down the complex topics, concepts, and methodologies in these documents into clear explanations.');
      }
    } else if (actionType === 'compare') {
      if (docCount >= 2) {
        onSendMessage('Compare the core themes, methodologies, and contrasting findings across the uploaded documents.');
      } else if (docCount === 1) {
        onSendMessage(`Analyze any contrasting viewpoints, internal comparisons, or distinct sections highlighted within ${primaryDocTitle}.`);
      } else {
        onSendMessage('Compare the similarities, differences, and conflicting information across the documents.');
      }
    }
  }, [hasDocuments, primaryDocTitle, docCount, onSendMessage, onOpenUpload]);

  const handlePromptChip = useCallback((promptText) => {
    if (!hasDocuments || isLoading) {
      if (onOpenUpload) onOpenUpload();
      return;
    }
    onSendMessage(promptText);
  }, [hasDocuments, isLoading, onSendMessage, onOpenUpload]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  return (
    <div className="cited-chat-interface">
      {/* Messages / Hero Scroll Area */}
      <div className="messages-container">
        {!hasMessages ? (
          <div className="hero-workspace">
            {/* Eyebrow Label */}
            <div className="hero-eyebrow">
              <Sparkles size={13} className="hero-eyebrow-icon" />
              <span>YOUR AI RESEARCH WORKSPACE</span>
            </div>

            {/* Main Heading */}
            <h1 className="hero-title">
              Turn documents into understanding.
            </h1>

            {/* Description */}
            <p className="hero-description">
              Ask questions, uncover insights, and explore your documents with answers backed by precise source citations.
            </p>

            {/* Context-Aware Document Status Indicator */}
            {hasDocuments ? (
              <div className="hero-status-pill">
                <span className="status-indicator-dot"></span>
                <span className="hero-status-text">
                  {docCount} {docCount === 1 ? 'document' : 'documents'} ready
                  {totalChunks > 0 ? ` · ${totalChunks} chunks indexed` : ''}
                </span>
                {primaryDocTitle && primaryDocTitle !== 'the document' && (
                  <span className="hero-doc-tag" title={primaryDocName}>
                    {primaryDocTitle}
                  </span>
                )}
              </div>
            ) : (
              <div className="hero-status-pill hero-status-pill--awaiting" onClick={onOpenUpload}>
                <UploadCloud size={12} />
                <span className="hero-status-text">No documents loaded &mdash; upload PDFs in the sidebar to begin</span>
              </div>
            )}

            {/* Centerpiece: Spacious AI Chat Input / Composer */}
            <div className="hero-composer-wrapper">
              <ComposerForm
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                disabled={!hasDocuments}
                hasDocuments={hasDocuments}
                docCount={docCount}
                onOpenUpload={onOpenUpload}
                placeholder={
                  !hasDocuments
                    ? 'Upload PDF documents in the sidebar to begin…'
                    : 'Ask anything about your documents…'
                }
                isWelcomeScreen={true}
              />
              <div className="composer-footer-text">
                <span>Answers grounded in verified PDF context with exact page citations.</span>
              </div>
            </div>

            {/* Three-Card Suggestion Layout */}
            <div className="hero-suggestions-section">
              <div className="suggestions-cards-grid">
                {/* Card 1: Summarize */}
                <button
                  type="button"
                  className="suggestion-action-card"
                  onClick={() => handleCardAction('summarize')}
                >
                  <div className="card-top-row">
                    <div className="card-icon-box card-icon-summarize">
                      <FileText size={18} />
                    </div>
                    <span className="card-arrow-indicator" aria-hidden="true">
                      <ArrowRight size={13} />
                    </span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Summarize</h3>
                    <p className="card-desc">
                      Extract important insights and key takeaways from your documents.
                    </p>
                  </div>
                </button>

                {/* Card 2: Understand */}
                <button
                  type="button"
                  className="suggestion-action-card"
                  onClick={() => handleCardAction('understand')}
                >
                  <div className="card-top-row">
                    <div className="card-icon-box card-icon-understand">
                      <GraduationCap size={18} />
                    </div>
                    <span className="card-arrow-indicator" aria-hidden="true">
                      <ArrowRight size={13} />
                    </span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Understand</h3>
                    <p className="card-desc">
                      Break down complex topics into clear explanations.
                    </p>
                  </div>
                </button>

                {/* Card 3: Compare */}
                <button
                  type="button"
                  className="suggestion-action-card"
                  onClick={() => handleCardAction('compare')}
                >
                  <div className="card-top-row">
                    <div className="card-icon-box card-icon-compare">
                      <GitCompare size={18} />
                    </div>
                    <span className="card-arrow-indicator" aria-hidden="true">
                      <ArrowRight size={13} />
                    </span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Compare</h3>
                    <p className="card-desc">
                      Discover similarities, differences, and conflicting information.
                    </p>
                  </div>
                </button>
              </div>

              {/* Contextual Quick Prompts (Real Document Suggestions) */}
              {hasDocuments && contextualPrompts.length > 0 && (
                <div className="hero-contextual-prompts">
                  <span className="contextual-prompts-label">Quick Inquiries</span>
                  <div className="contextual-prompts-row">
                    {contextualPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="contextual-prompt-chip"
                        onClick={() => handlePromptChip(p)}
                        title={p}
                      >
                        <Sparkles size={11} className="prompt-chip-icon" />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Onboarding Call to Action when No Documents are Loaded */}
              {!hasDocuments && (
                <div className="hero-onboarding-cta-box">
                  <button
                    type="button"
                    className="btn-primary hero-upload-cta"
                    onClick={onOpenUpload}
                  >
                    <UploadCloud size={15} />
                    <span>Upload Your First PDF to Begin</span>
                  </button>
                  <span className="onboarding-subtext">
                    Supports research papers, roadmaps, technical manuals, and multi-page reports.
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="messages-stream">
            {messages.map((msg, index) => (
              <MessageBubble
                key={index}
                index={index}
                message={msg}
                onFeedback={onFeedback}
              />
            ))}
          </div>
        )}

        {/* Indeterminate reading indicator during AI retrieval */}
        {isLoading && <ReadingSourcesIndicator />}

        <div ref={scrollEndRef} />
      </div>

      {/* Floating Bottom Composer (Visible during active conversation) */}
      {hasMessages && (
        <div className="chat-composer-container">
          <ComposerForm
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            disabled={!hasDocuments}
            hasDocuments={hasDocuments}
            docCount={docCount}
            onOpenUpload={onOpenUpload}
            placeholder={placeholder}
            isWelcomeScreen={false}
          />
          <div className="composer-footer-text">
            <span>Answers grounded in verified PDF context with exact page citations.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitedAnswerChatInput;