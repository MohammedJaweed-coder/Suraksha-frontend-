import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Mic, X, CheckCircle2, AlertCircle, File, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../lib/api';

interface MediaUploadProps {
  onSuccess?: (file: File) => void;
  maxSizeMB?: number;
}

export default function MediaUpload({ onSuccess, maxSizeMB = 10 }: MediaUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadSuccess(false);
    setProgress(0);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setUploadSuccess(false);
    setProgress(0);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate File Type
    if (!file.type.startsWith('image/') && !file.type.startsWith('audio/')) {
      setError('Please upload an image or audio file only.');
      return;
    }

    // Validate File Size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('mediaFile', selectedFile);
    formData.append('latitude', '12.9716');
    formData.append('longitude', '77.5946');
    formData.append('violationType', 'OTHER');
    formData.append('timestamp', new Date().toISOString());

    try {
      await api.post('/incidents/violation', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      // Show 100% briefly before success screen
      setProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
        if (onSuccess) onSuccess(selectedFile);
      }, 500);

    } catch (err: any) {
      console.error('Upload Error:', err);
      setIsUploading(false);
      setProgress(0);
      setError('An error occurred during upload. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/50 p-6 shadow-xl">
        
        <h3 className="text-xl font-bold text-white mb-2">Upload Evidence</h3>
        <p className="text-sm text-slate-400 mb-6">Attach a photo or audio recording to your report.</p>

        <AnimatePresence mode="wait">
          {uploadSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Upload Complete</h4>
              <p className="text-sm text-slate-400 mb-6">Your file has been securely transmitted.</p>
              <button 
                onClick={removeFile}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Upload another file
              </button>
            </motion.div>
          ) : isUploading ? (
            <motion.div 
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6"
            >
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-300">Uploading {selectedFile?.name}</span>
                <span className="text-xs font-bold text-blue-400">{progress}%</span>
              </div>
              
              <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Encrypting & Transmitting...
              </div>
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {!selectedFile ? (
                /* Drag & Drop Zone */
                <div 
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-950/50 hover:bg-blue-500/5 rounded-xl p-8 text-center transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="mx-auto h-12 w-12 bg-slate-800 group-hover:bg-blue-500/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">SVG, PNG, JPG or MP3, WAV (Max. {maxSizeMB}MB)</p>
                </div>
              ) : (
                /* Selected File Preview */
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                      {selectedFile.type.startsWith('audio/') ? (
                        <Mic className="h-5 w-5 text-blue-400" />
                      ) : selectedFile.type.startsWith('image/') ? (
                        <ImageIcon className="h-5 w-5 text-blue-400" />
                      ) : (
                        <File className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={removeFile}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,audio/*" 
                onChange={handleFileChange}
              />

              {/* Upload Button */}
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-wide shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors"
                >
                  Upload Evidence
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
