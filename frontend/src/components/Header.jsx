import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  FileText,
  GraduationCap,
  GitCompare,
  RotateCcw,
  Download,
  PanelLeft,
  PanelLeftClose,
  Cpu,
  AlertCircle,
} from 'lucide-react';
import { CiteQuireIcon } from './CiteQuireIcon';

/* ─── Tab definitions ──────────────────────────────────────────────────────── */
const TABS = [
  { id: 'chat', label: 'Chat', Icon: MessageSquare },
  { id: 'summary', label: 'Summary', Icon: FileText },
  { id: 'study', label: 'Study Mode', Icon: GraduationCap },
  { id: 'compare', label: 'Compare', Icon: GitCompare },
];

/* ─── Header ───────────────────────────────────────────────────────────────── */
export const Header = ({
  activeMode,
  onModeChange,
  systemStatus,
  onNewConversation,
  onExportChat,
  onToggleSidebar,
  isSidebarCollapsed,
  hasMessages,
}) => {
  const isReady = systemStatus?.status === 'ready';
  const hasKeys = systemStatus?.has_google_key && systemStatus?.has_groq_key;
  const model = systemStatus?.groq_model ?? null;
  // Strip provider prefix (e.g. "openai/gpt-4o" → "gpt-4o") to save badge width
  const modelDisplay = model
    ? (model.includes('/') ? model.split('/').pop() : model)
    : null;

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Status badge */
  let statusNode = null;
  if (systemStatus === null) {
    statusNode = (
      <div className="hdr-status hdr-status--connecting" title="Connecting to backend…">
        <span className="hdr-status-dot" />
        <span>Connecting</span>
      </div>
    );
  } else if (!hasKeys) {
    statusNode = (
      <div className="hdr-status hdr-status--warning" title="Add keys to backend/.env">
        <AlertCircle size={11} />
        <span>Keys Needed</span>
      </div>
    );
  } else if (isReady) {
    statusNode = (
      <div className="hdr-status hdr-status--online" title="Knowledge base indexed">
        <span className="hdr-status-dot hdr-status-dot--green" />
        <span>Online</span>
      </div>
    );
  } else {
    statusNode = (
      <div className="hdr-status hdr-status--idle" title="Upload PDFs to begin">
        <span className="hdr-status-dot" />
        <span>Awaiting PDFs</span>
      </div>
    );
  }

  return (
    <header className="app-header">
      {/* ── LEFT: sidebar toggle + brand ── */}
      <div className="app-header__left">
        <button
          type="button"
          className="hdr-icon-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed
            ? <PanelLeft size={16} />
            : <PanelLeftClose size={16} />}
        </button>

        {/* Brand mark — only shown when sidebar is collapsed or on mobile */}
        {(isSidebarCollapsed || isMobile) && (
          <div className="hdr-brand">
            <CiteQuireIcon size={18} />
            <span className="hdr-brand-name">CiteQuire</span>
          </div>
        )}
      </div>

      {/* ── CENTER: main navigation tabs ── */}
      <nav className="app-header__nav" aria-label="Main navigation">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeMode === id;
          return (
            <button
              key={id}
              type="button"
              className={`hdr-tab${isActive ? ' hdr-tab--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onModeChange(id)}
              title={label}
            >
              <Icon
                size={isMobile ? 17 : 16}
                strokeWidth={isActive ? 2.2 : 1.8}
                aria-hidden="true"
              />
              {!isMobile && <span className="hdr-tab-label">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── RIGHT: utility controls ── */}
      <div className="app-header__right">
        {/* Model badge */}
        {modelDisplay && (
          <div
            className="hdr-model"
            title={`Active LLM: ${model}`}
          >
            <Cpu size={11} aria-hidden="true" />
            <span className="hdr-model-name">{modelDisplay}</span>
          </div>
        )}

        {/* Connection status */}
        {statusNode}

        {/* Export — only when conversation exists */}
        {hasMessages && (
          <button
            type="button"
            className="hdr-btn"
            onClick={onExportChat}
            title="Export conversation as Markdown"
          >
            <Download size={13} aria-hidden="true" />
            <span>Export</span>
          </button>
        )}

        {/* New Chat */}
        <button
          type="button"
          className="hdr-btn hdr-btn--primary"
          onClick={onNewConversation}
          title="Start a new chat session"
        >
          <RotateCcw size={13} aria-hidden="true" />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
};

export default Header;