/**
 * File Upload Component using react-dropzone
 * Provides drag & drop file upload with preview
 */

import { useCallback, useState } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedFile {
	file: File;
	preview?: string;
	id: string;
}

export interface FileUploadProps {
	/** Accepted file types */
	accept?: Accept;
	/** Maximum number of files */
	maxFiles?: number;
	/** Maximum file size in bytes */
	maxSize?: number;
	/** Whether multiple files are allowed */
	multiple?: boolean;
	/** Callback when files are selected */
	onFilesChange?: (files: UploadedFile[]) => void;
	/** Callback when upload is triggered */
	onUpload?: (files: File[]) => Promise<void>;
	/** Whether the component is disabled */
	disabled?: boolean;
	/** Custom class name */
	className?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Show preview for images */
	showPreview?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
	return Math.random().toString(36).substring(2, 9);
}

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function isImageFile(file: File): boolean {
	return file.type.startsWith("image/");
}

// ============================================================================
// FILE PREVIEW COMPONENT
// ============================================================================

interface FilePreviewProps {
	uploadedFile: UploadedFile;
	onRemove: (id: string) => void;
	showPreview: boolean;
}

function FilePreview({ uploadedFile, onRemove, showPreview }: FilePreviewProps) {
	const { file, preview, id } = uploadedFile;
	const isImage = isImageFile(file);

	return (
		<div className="group relative flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
			{/* Thumbnail / Icon */}
			<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700">
				{isImage && showPreview && preview ? (
					<img src={preview} alt={file.name} className="size-full object-contain" />
				) : isImage ? (
					<PhotoIcon className="size-6 text-zinc-400" />
				) : (
					<DocumentIcon className="size-6 text-zinc-400" />
				)}
			</div>

			{/* File Info */}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">{formatFileSize(file.size)}</p>
			</div>

			{/* Status / Remove */}
			<div className="flex items-center gap-2">
				<CheckCircleIcon className="size-5 text-emerald-500" />
				<button
					type="button"
					onClick={() => onRemove(id)}
					className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
				>
					<XMarkIcon className="size-4" />
				</button>
			</div>
		</div>
	);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FileUpload({
	accept,
	maxFiles = 5,
	maxSize = 10 * 1024 * 1024, // 10MB default
	multiple = true,
	onFilesChange,
	disabled = false,
	className,
	placeholder = "Drag & drop files here, or click to select",
	showPreview = true,
}: FileUploadProps) {
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [error, setError] = useState<string | null>(null);

	const onDrop = useCallback(
		(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
			setError(null);

			// Handle rejected files
			if (rejectedFiles.length > 0) {
				const rejection = rejectedFiles[0];
				const errorCode = rejection.errors[0]?.code;

				if (errorCode === "file-too-large") {
					setError(`File is too large. Maximum size is ${formatFileSize(maxSize)}`);
				} else if (errorCode === "file-invalid-type") {
					setError("File type not supported");
				} else if (errorCode === "too-many-files") {
					setError(`Maximum ${maxFiles} files allowed`);
				} else {
					setError("Invalid file");
				}
				return;
			}

			// Check max files limit
			if (files.length + acceptedFiles.length > maxFiles) {
				setError(`Maximum ${maxFiles} files allowed`);
				return;
			}

			// Create uploaded file objects
			const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
				file,
				preview: isImageFile(file) ? URL.createObjectURL(file) : undefined,
				id: generateId(),
			}));

			const updatedFiles = [...files, ...newFiles];
			setFiles(updatedFiles);
			onFilesChange?.(updatedFiles);
		},
		[files, maxFiles, maxSize, onFilesChange]
	);

	const removeFile = useCallback(
		(id: string) => {
			const fileToRemove = files.find((f) => f.id === id);
			if (fileToRemove?.preview) {
				URL.revokeObjectURL(fileToRemove.preview);
			}

			const updatedFiles = files.filter((f) => f.id !== id);
			setFiles(updatedFiles);
			onFilesChange?.(updatedFiles);
		},
		[files, onFilesChange]
	);

	const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
		onDrop,
		accept,
		maxFiles: multiple ? maxFiles : 1,
		maxSize,
		multiple,
		disabled,
	});

	// Check if we've reached the file limit (for single file mode, hide dropzone when file is uploaded)
	const hasReachedLimit = files.length >= maxFiles;

	return (
		<div className={className}>
			{/* Dropzone - Hide when file limit is reached */}
			{!hasReachedLimit && (
				<div
					{...getRootProps()}
					className={clsx(
						"relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
						isDragActive && !isDragReject && "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20",
						isDragReject && "border-red-400 bg-red-50 dark:bg-red-950/20",
						!isDragActive && "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500",
						disabled && "cursor-not-allowed opacity-50"
					)}
				>
					<input {...getInputProps()} />

					<CloudArrowUpIcon
						className={clsx(
							"mx-auto size-10",
							isDragActive && !isDragReject && "text-emerald-500",
							isDragReject && "text-red-500",
							!isDragActive && "text-zinc-400"
						)}
					/>

					<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
						{isDragActive ? (isDragReject ? "File not supported" : "Drop files here") : placeholder}
					</p>

					<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
						Max {formatFileSize(maxSize)} per file
						{multiple && ` (up to ${maxFiles} files)`}
					</p>
				</div>
			)}

			{/* Error Message */}
			{error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

			{/* File Previews */}
			{files.length > 0 && (
				<div className={clsx(!hasReachedLimit && "mt-4", "space-y-2")}>
					{files.map((uploadedFile) => (
						<FilePreview key={uploadedFile.id} uploadedFile={uploadedFile} onRemove={removeFile} showPreview={showPreview} />
					))}
				</div>
			)}
		</div>
	);
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/** Image upload preset */
export const IMAGE_UPLOAD_ACCEPT: Accept = {
	"image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
};

/** Document upload preset */
export const DOCUMENT_UPLOAD_ACCEPT: Accept = {
	"application/pdf": [".pdf"],
	"image/*": [".jpeg", ".jpg", ".png"],
};

/** Screenshot upload preset (for proof submission) */
export const SCREENSHOT_UPLOAD_ACCEPT: Accept = {
	"image/*": [".jpeg", ".jpg", ".png", ".webp"],
};
