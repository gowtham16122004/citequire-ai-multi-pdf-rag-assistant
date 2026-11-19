import * as React from "react";
import { FileText, FileSpreadsheet, FileCheck, Upload } from "lucide-react";
import { Card } from "./card";

const ICON_TRANSFORMS = [
  {
    idle: "translate(-78%, -50%) rotate(-8deg)",
    active: "translate(-114%, -50%) rotate(-12deg) scale(1.08)",
  },
  {
    idle: "translate(-50%, -50%) rotate(0deg)",
    active: "translate(-50%, -50%) rotate(0deg) scale(1.18)",
  },
  {
    idle: "translate(-22%, -50%) rotate(8deg)",
    active: "translate(14%, -50%) rotate(12deg) scale(1.08)",
  },
];

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function UploadIconCluster({ isDragging }) {
  const icons = [
    { label: "Document", icon: FileText },
    { label: "PDF", icon: FileCheck },
    { label: "Sheet", icon: FileSpreadsheet },
  ];

  return (
    <div className="upload-icon-cluster">
      {icons.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Card
            key={item.label}
            className={`cluster-card cluster-card-${index} ${index === 1 ? 'z-center' : ''} ${isDragging ? 'is-dragging' : ''}`}
            style={{
              transform: isDragging
                ? ICON_TRANSFORMS[index]?.active
                : ICON_TRANSFORMS[index]?.idle,
            }}
          >
            <IconComponent size={18} />
          </Card>
        );
      })}
    </div>
  );
}

export function FileUploadUI({
  accept = ".pdf,application/pdf",
  browseLabel = "Browse files",
  className = "",
  description = "PDF documents (up to 50MB)",
  draggingLabel = "Drop to add",
  multiple = true,
  title = "Click to upload or drop files",
  onFilesAccepted,
}) {
  const dragDepthRef = React.useRef(0);
  const inputRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [rejectionMessage, setRejectionMessage] = React.useState(null);

  const commitFiles = React.useCallback(
    (nextFiles) => {
      const acceptedFiles = Array.from(nextFiles).filter((file) => {
        if (!accept) return true;
        return accept.split(",").some((rawToken) => {
          const token = rawToken.trim().toLowerCase();
          if (!token) return false;
          if (token.startsWith(".")) return file.name.toLowerCase().endsWith(token);
          if (token.endsWith("/*")) return file.type.toLowerCase().startsWith(token.slice(0, -1));
          return file.type.toLowerCase() === token;
        });
      });

      if (acceptedFiles.length === 0) {
        setRejectionMessage("Only .pdf documents are supported.");
        return;
      }

      setRejectionMessage(null);
      if (onFilesAccepted) onFilesAccepted(acceptedFiles);
    },
    [accept, onFilesAccepted]
  );

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`file-upload-component ${className}`}>
      <div
        role="button"
        tabIndex={0}
        className={`upload-dropzone-box ${isDragging ? 'dragging' : ''}`}
        onClick={openFileDialog}
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepthRef.current += 1;
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) setIsDragging(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          dragDepthRef.current = 0;
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) {
            commitFiles(e.dataTransfer.files);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFileDialog();
          }
        }}
      >
        <UploadIconCluster isDragging={isDragging} />

        <div className="dropzone-text-group">
          <div className="dropzone-title">{title}</div>
          <div className="dropzone-desc">{description}</div>
          {rejectionMessage && (
            <div className="dropzone-error">{rejectionMessage}</div>
          )}
        </div>

        <div className="browse-pill-btn">
          <Upload size={13} />
          <span>{isDragging ? draggingLabel : browseLabel}</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) {
              commitFiles(e.target.files);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}

export default FileUploadUI;
