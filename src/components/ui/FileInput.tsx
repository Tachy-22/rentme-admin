import { useState, useRef, DragEvent } from "react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/actions/upload";
import { X, Music, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FileMetadata {
  url: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface FileInputProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  maxFileSize?: number; // in MB
  onUploadComplete?: (files: FileMetadata[]) => void;
  onError?: (error: string) => void;
  className?: string;
  initialFiles?: string[];
}

interface FileWithProgress {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

const isImageType = (type: string) => type.startsWith("image/");
const isAudioType = (type: string) => type.startsWith("audio/");
const isPDFType = (type: string) => type === "application/pdf";

const FileTypeIcon = ({ file }: { file: File }) => {
  //console.log("file", file);
  if (isAudioType(file.type)) {
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-purple-50 rounded-lg">
        <Music className="w-6 h-6 text-purple-500" />
      </div>
    );
  }
  if (isPDFType(file.type)) {
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-lg">
        <FileText className="w-6 h-6 text-red-500" />
      </div>
    );
  }
  return null;
};

const getFileTypeFromUrl = (url: string): string => {
  const extension = url.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "mp3":
    case "wav":
      return "audio/mpeg";
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
};

export function FileInput({
  multiple = false,
  accept = "*/*",
  maxSize = 5,
  maxFileSize = 10, // default 10MB per file
  onUploadComplete,
  onError,
  className,
  initialFiles = [],
}: FileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithProgress[]>(() =>
    initialFiles.map((url) => {
      const filename = url.split("/").pop() || "file";
      const type = getFileTypeFromUrl(url);
      // Create a blob with some content to give it a size
      const blob = new Blob([""], { type });
      const file = new File([blob], filename, {
        type,
        lastModified: Date.now(),
      });
      return {
        file,
        progress: 100,
        url,
      };
    })
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const removeFile = (fileToRemove: FileWithProgress) => {
    setFiles((prev) => prev.filter((f) => f.file !== fileToRemove.file));
    // Get remaining files and notify parent
    const remainingFiles = files
      .filter((f) => f.file !== fileToRemove.file && f.url)
      .map((f) => ({
        url: f.url as string,
        name: f.file.name,
        size: f.file.size,
        type: f.file.type,
        lastModified: f.file.lastModified,
      }));
    onUploadComplete?.(remainingFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";

    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      const kb = bytes / 1024;
      return kb < 10 ? `${kb.toFixed(2)} KB` : `${Math.round(kb)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      const mb = bytes / (1024 * 1024);
      return mb < 10 ? `${mb.toFixed(2)} MB` : `${Math.round(mb)} MB`;
    } else {
      const gb = bytes / (1024 * 1024 * 1024);
      return gb < 10 ? `${gb.toFixed(2)} GB` : `${Math.round(gb)} GB`;
    }
  };

  const validateFile = (file: File): string | null => {
    if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB`;
    }
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB`;
    }
    if (
      accept !== "*/*" &&
      !accept.split(",").some((type) => file.type.match(type))
    ) {
      return "File type not accepted";
    }
    return null;
  };

  const handleFiles = async (newFiles: FileList) => {
    const filesToUpload = Array.from(newFiles).map((file) => ({
      file,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...filesToUpload]);

    for (const fileData of filesToUpload) {
      const error = validateFile(fileData.file);
      if (error) {
        onError?.(error);
        setFiles((prev) =>
          prev.map((f) => (f.file === fileData.file ? { ...f, error } : f))
        );
        continue;
      }

      try {
        // Initialize progress at 0
        let currentProgress = 0;

        // Create a more predictable progress simulation
        const progressInterval = setInterval(() => {
          // Increment by 1 until 90%
          if (currentProgress < 90) {
            currentProgress += 1;
            setFiles((prev) =>
              prev.map((f) =>
                f.file === fileData.file
                  ? { ...f, progress: currentProgress }
                  : f
              )
            );
          }
        }, 50); // Update every 50ms for smooth animation

        const buffer = await fileData.file.arrayBuffer();

        // Set to 95% when file is read
        setFiles((prev) =>
          prev.map((f) =>
            f.file === fileData.file ? { ...f, progress: 95 } : f
          )
        );

        const result = await uploadFile({
          buffer,
          filename: fileData.file.name,
          contentType: fileData.file.type,
        });

        clearInterval(progressInterval);

        if ("error" in result) {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === fileData.file
                ? { ...f, error: result.error, progress: 0 }
                : f
            )
          );
          onError?.(result.error as string);
        } else {
          // Set to 100% when complete
          setFiles((prev) =>
            prev.map((f) =>
              f.file === fileData.file
                ? { ...f, url: result.url, progress: 100 }
                : f
            )
          );

          const completedFiles = files
            .filter((f) => f.url)
            .map((f) => ({
              url: f.url as string,
              name: f.file.name,
              size: f.file.size,
              type: f.file.type,
              lastModified: f.file.lastModified,
            }));

          const newFileMetadata: FileMetadata = {
            url: result.url,
            name: fileData.file.name,
            size: fileData.file.size,
            type: fileData.file.type,
            lastModified: fileData.file.lastModified,
          };

          onUploadComplete?.([...completedFiles, newFileMetadata]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.file === fileData.file
              ? { ...f, error: errorMessage, progress: 0 }
              : f
          )
        );
        onError?.(errorMessage);
      }
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  //console.log({files})

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
          className
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <p>Drag and drop files here, or click to select files</p>
        <p className="text-sm text-gray-500">
          {multiple ? "Upload multiple files" : "Upload a file"}
          {accept !== "*/*" && ` (${accept})`}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                {isImageType(file.file.type) && file.url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={file.url}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <FileTypeIcon file={file.file} />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium truncate">{file.file.name}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <span>{formatFileSize(file.file.size)}</span>
                        <span>•</span>
                        <span>{file.file.type || "Unknown type"}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {file.progress < 100 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-300",
                                file.error ? "bg-red-500" : "bg-blue-500"
                              )}
                              style={{
                                width: `${Math.min(
                                  Math.round(file.progress),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-[3ch]">
                            {Math.round(file.progress)}%
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {file.error && (
                    <p className="text-sm text-red-500 mt-2">{file.error}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
