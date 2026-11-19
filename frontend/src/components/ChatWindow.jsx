import React, { useEffect, useRef } from 'react';
import { Sparkles, UploadCloud } from 'lucide-react';
import { CiteQuireIcon } from './CiteQuireIcon';
import { MessageBubble } from './MessageBubble';

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

export const ChatWindow = ({
  messages,
  isLoading,
  onSelectSuggested,
  onFeedback,
  hasDocuments,
  onOpenUpload,
}) => {
  const scrollEndRef = useRef(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sampleQuestions = [
    'What are the core arguments and conclusions?',
    'Explain any laws, formulas, or theorems cited.',
    'Are there conflicting findings or recommendations?',
  ];

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-workspace">
          <div className="empty-workspace-badge">
            <CiteQuireIcon size={22} />
          </div>
          <h2 className="empty-workspace-title">Research your documents</h2>
          <p className="empty-workspace-desc">
            Upload PDFs in the sidebar to extract verified context. All answers cite the exact source document and page number.
          </p>
          {!hasDocuments ? (
            <button
              type="button"
              className="btn-primary btn-empty-cta"
              onClick={onOpenUpload}
            >
              <UploadCloud size={14} />
              <span>Upload PDFs to begin</span>
            </button>
          ) : (
            <div className="prompt-suggestions">
              <span className="suggestions-label">Suggested inquiries</span>
              <div className="suggestions-grid">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="prompt-chip"
                    onClick={() => onSelectSuggested(q)}
                    title={`Ask: "${q}"`}
                  >
                    <Sparkles size={11} className="prompt-chip-icon" />
                    <span className="prompt-chip-text">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
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

      {isLoading && <ReadingSourcesIndicator />}

      <div ref={scrollEndRef} />
    </div>
  );
};