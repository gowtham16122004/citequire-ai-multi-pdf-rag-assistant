import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

export const ChatComposer = ({ onSendMessage, isLoading, disabled, placeholder }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const canSend = input.trim().length > 0 && !isLoading && !disabled;

  const handleSubmit = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (!canSend) return;
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    [canSend, input, onSendMessage]
  );

  const handleKeyDown = (e) => {
    // IME-safe: skip composition events
    if (e.isComposing || e.nativeEvent?.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  return (
    <div className="chat-composer-container">
      <form className="composer-card" onSubmit={handleSubmit} noValidate>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (disabled
              ? 'Upload PDF documents to begin…'
              : 'Ask a question across your documents…')
          }
          disabled={disabled || isLoading}
          className="composer-textarea"
          aria-label="Ask a question across your indexed PDFs"
        />

        <div className="composer-actions">
          <button
            type="submit"
            className={`btn-send ${canSend ? 'btn-send--active' : ''}`}
            disabled={!canSend}
            title={canSend ? 'Send (Enter)' : 'Type a question first'}
            aria-label="Send query"
          >
            <ArrowUp size={14} strokeWidth={2.5} />
          </button>
        </div>
      </form>

      <div className="composer-footer-text">
        <span>Answers grounded in verified PDF context with exact page citations.</span>
      </div>
    </div>
  );
};
