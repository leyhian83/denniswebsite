import { useRef, useState } from "react";
import { ImagePlus, Film, Loader2, X } from "lucide-react";
import { uploadProjectMedia, type UploadedMedia } from "../../services/projectService";

export type { UploadedMedia };

interface MediaUploaderProps {
  /** Slug of the project these files are being uploaded for. */
  slug: string;
  /** Authoritative list of uploaded items (owned by the parent). */
  value: UploadedMedia[];
  /** Full-list change notification (additions and removals). */
  onChange: (items: UploadedMedia[]) => void;
  /** Kind of files this instance accepts. */
  kind: "image" | "video";
}

/**
 * Photo / video uploader for the admin "add project" form.
 *
 * In dev, files are POSTed to /__admin/media (base64 JSON) and saved into
 * public/media/projects/<slug>/. The returned public URLs flow back through
 * `onChange` so the parent fills the project's `photos` / `videos`.
 */
export function MediaUploader({ slug, value, onChange, kind }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isImage = kind === "image";

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    const res = await uploadProjectMedia(Array.from(files), slug);
    if (!res.ok) {
      setError(res.error);
      setUploading(false);
      return;
    }
    onChange([...value, ...res.items.filter((i) => i.kind === kind)]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="media-uploader">
      <button
        type="button"
        className="media-uploader__btn"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || !slug}
      >
        {isImage ? <ImagePlus size={18} aria-hidden="true" /> : <Film size={18} aria-hidden="true" />}
        {isImage ? "Add photos" : "Add video"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={isImage ? "image/*" : "video/*"}
        multiple={isImage}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploading && (
        <div className="media-uploader__status" role="status">
          <Loader2 size={14} className="media-uploader__spin" aria-hidden="true" /> Uploading…
        </div>
      )}
      {error && (
        <div className="media-uploader__status media-uploader__status--error" role="alert">
          {error}
        </div>
      )}
      {!slug && !error && !uploading && (
        <p className="media-uploader__hint">
          Add a project name first so files save to the right folder.
        </p>
      )}

      {value.length > 0 && (
        <ul className="media-uploader__list" role="list">
          {value.map((it, i) => (
            <li key={it.url} className="media-uploader__item">
              {it.kind === "image" ? (
                <img src={it.url} alt="" className="media-uploader__thumb" />
              ) : (
                <span className="media-uploader__film">
                  <Film size={18} aria-hidden="true" />
                </span>
              )}
              <div className="media-uploader__meta">
                <span className="media-uploader__name">{it.fileName}</span>
                <span className="media-uploader__tag">{it.kind}</span>
              </div>
              <button
                type="button"
                className="media-uploader__remove"
                onClick={() => remove(i)}
                aria-label={`Remove ${it.fileName}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
