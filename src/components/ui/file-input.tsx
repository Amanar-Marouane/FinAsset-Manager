'use client';

import { AppContext } from '@/contexts/AppProvider';
import { cn } from '@/lib/utils';
import { File, FileText, Image, Plus, Upload, X } from 'lucide-react';
import { useContext, useRef, useState } from 'react';
import { Button } from './button';

const FileInput = ({
    files = [],
    onFilesChange,
    className = "",
    maxFiles = 10,
    maxSizePerFile = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ['image/*', '.pdf', '.csv', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.sql', 'image/png', 'image/jpg', 'image/jpeg', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
}) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const { showError, showSuccess, showWarning } = useContext(AppContext);

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <Image className="h-4 w-4 text-blue-500" />;
        } else if (file.type === 'application/pdf') {
            return <FileText className="h-4 w-4 text-red-500" />;
        } else if (file.type.includes('document') || file.type.includes('word')) {
            return <FileText className="h-4 w-4 text-blue-600" />;
        } else if (file.type.includes('sheet') || file.type.includes('excel') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return <FileText className="h-4 w-4 text-green-600" />;
        }
        return <File className="h-4 w-4 text-gray-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file) => {
        if (file.size > maxSizePerFile) {
            showError(`Le fichier "${file.name}" est trop volumineux`);
            return false;
        }
        return true;
    };

    const handleFiles = (newFiles) => {
        const validFiles = Array.from(newFiles).filter(validateFile);

        if (files.length + validFiles.length > maxFiles) {
            showWarning(`Limite de fichiers atteinte`);
            return;
        }

        if (validFiles.length > 0) {
            const updatedFiles = [...files, ...validFiles];
            onFilesChange(updatedFiles);

            showSuccess(`${validFiles.length} fichier(s) ajouté(s) avec succès`);
        }
    };

    const handleFileInput = (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFiles(selectedFiles);
        }
        // Reset input value to allow selecting same file again
        e.target.value = '';
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        onFilesChange(newFiles);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={cn("space-y-3", className)}>
            {files.length < maxFiles && (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedTypes.join(',')}
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                            files.length >= maxFiles && "opacity-50 pointer-events-none"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">
                            Glissez et déposez des fichiers ici
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                            ou cliquez pour sélectionner des fichiers
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openFileDialog}
                            disabled={files.length >= maxFiles}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter des fichiers
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-3">
                            {files.length} / {maxFiles} fichiers • Max: {formatFileSize(maxSizePerFile)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Formats acceptés: Images (PNG, JPG, JPEG), PDF, Word, Excel, CSV, Texte, SQL
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Taille maximale par fichier: {formatFileSize(maxSizePerFile)}
                        </p>
                    </div>
                </>
            )}

            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1">
                        {files.map((file, index) => (
                            <div key={index} className="group">
                                <div className="flex items-center gap-2 p-2 border rounded bg-background hover:bg-primary/30 transition-colors">
                                    <div className="flex-shrink-0">
                                        {getFileIcon(file)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-medium truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatFileSize(file.size)}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-destructive text-xs documents-${index}-error error-p `}></p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export { FileInput };

