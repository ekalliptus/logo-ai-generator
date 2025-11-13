import { Button } from '../ui/Button';

/**
 * Actions container for download and copy buttons
 */
export function ActionsContainer({
  imageUrl,
  fileName,
  onCopyPrompt,
  isCopied,
  hasImages,
  onDownloadAll,
  hasMultiple,
}) {
  if (!hasImages) return null;

  return (
    <div className="flex gap-4 flex-wrap">
      <a
        href={imageUrl}
        download={fileName || 'logo.png'}
        className="btn-primary no-underline"
      >
        Download PNG
      </a>

      {hasMultiple && (
        <Button variant="secondary" onClick={onDownloadAll}>
          Download All
        </Button>
      )}

      <Button variant="outline" onClick={onCopyPrompt}>
        {isCopied ? '✓ Copied!' : 'Copy Prompt'}
      </Button>
    </div>
  );
}
