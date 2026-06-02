import { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud, Image as ImageIcon, File, CheckCircle, AlertCircle } from "lucide-react";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";
import { cn } from "../lib/utils";

// 文件上传状态类型
type UploadStatus = "idle" | "uploading" | "success" | "error";

// 文件项类型
interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  url?: string; // 上传成功后的OSS地址
  name?: string; // 原始文件名
  size?: number; // 文件大小
  type?: string; // 文件类型
}

interface FileUploadProps {
  // 允许的文件类型
  accept?: Record<string, string[]>;
  // 最大文件大小（字节），默认10MB
  maxSize?: number;
  // 最多上传文件数，默认10
  maxFiles?: number;
  // 上传成功后的回调
  onUploadSuccess?: (files: FileItem[]) => void;
  // 类名
  className?: string;
}

export function FileUpload({
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  onUploadSuccess,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<Viewer | null>(null);

  // 初始化ViewerJS预览
  useEffect(() => {
    if (viewerRef.current && !viewerInstanceRef.current) {
      viewerInstanceRef.current = new Viewer(viewerRef.current, {
        toolbar: {
          zoomIn: 1,
          zoomOut: 1,
          oneToOne: 1,
          reset: 1,
          prev: 1,
          play: 0,
          next: 1,
          rotateLeft: 1,
          rotateRight: 1,
          flipHorizontal: 0,
          flipVertical: 0,
        },
        zoomRatio: 0.1,
        minZoomRatio: 0.1,
        maxZoomRatio: 10,
        transition: true,
        url: "data-src",
      });
    }

    // 更新预览列表
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.update();
    }

    return () => {
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.destroy();
        viewerInstanceRef.current = null;
      }
    };
  }, [files]);

  // 真实OSS上传实现
  const uploadToOSS = useCallback(async (file: File, onProgress: (progress: number) => void): Promise<string> => {
    try {
      // 1. 先请求后端获取上传签名
      const signRes = await fetch("/api/oss-sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: file.name }),
      });

      if (!signRes.ok) {
        throw new Error("获取上传签名失败");
      }

      const signData = await signRes.json();
      if (!signData.success) {
        throw new Error(signData.message || "获取上传签名失败");
      }

      const { url, key, policy, OSSAccessKeyId, signature } = signData.data;

      // 2. 构造FormData上传到OSS
      const formData = new FormData();
      formData.append("key", key);
      formData.append("policy", policy);
      formData.append("OSSAccessKeyId", OSSAccessKeyId);
      formData.append("signature", signature);
      formData.append("success_action_status", "200");
      formData.append("file", file);

      // 3. 上传文件，带进度监听
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        // 监听进度
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });

        // 上传完成
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            // 上传成功，返回文件URL
            resolve(`${url}/${key}`);
          } else {
            reject(new Error(`上传失败，状态码：${xhr.status}`));
          }
        });

        // 上传错误
        xhr.addEventListener("error", () => {
          reject(new Error("上传失败，网络错误"));
        });

        xhr.open("POST", url);
        xhr.send(formData);
      });
    } catch (error) {
      throw error;
    }
  }, []);

  // 处理文件上传
  const processFiles = useCallback(async (newFiles: File[]) => {
    // 生成文件ID
    const newFileItems: FileItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: "uploading",
      progress: 0,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    // 添加到文件列表
    setFiles(prev => [...prev, ...newFileItems]);

    // 逐个上传
    for (const fileItem of newFileItems) {
      try {
        const url = await uploadToOSS(fileItem.file, (progress) => {
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, progress } : f
          ));
        });

        // 更新上传成功状态
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? { ...f, status: "success", url } : f
        ));
      } catch (error) {
        // 更新上传失败状态
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? {
            ...f,
            status: "error",
            error: error instanceof Error ? error.message : "上传失败",
          } : f
        ));
      }
    }

    // 所有上传完成后回调
    const successFiles = files.filter(f => f.status === "success");
    if (successFiles.length > 0 && onUploadSuccess) {
      onUploadSuccess(successFiles);
    }
  }, [files, uploadToOSS, onUploadSuccess]);

  // 删除文件
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      // 释放预览URL
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // 拖拽处理
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    onDrop: (acceptedFiles) => {
      setIsDragging(false);
      if (files.length + acceptedFiles.length > maxFiles) {
        alert(`最多只能上传 ${maxFiles} 个文件`);
        return;
      }
      processFiles(acceptedFiles);
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropRejected: (rejections) => {
      setIsDragging(false);
      const errors = rejections.map(r => {
        if (r.errors[0]?.code === "file-too-large") {
          return `文件 ${r.file.name} 超过大小限制（最大 ${maxSize / 1024 / 1024}MB）`;
        }
        if (r.errors[0]?.code === "file-invalid-type") {
          return `文件 ${r.file.name} 类型不支持`;
        }
        return `文件 ${r.file.name} 上传失败`;
      });
      alert(errors.join("\n"));
    }
  });

  // 判断是否是图片
  const isImageFile = (file: File) => file.type.startsWith("image/");

  // 使用ref保存最新的files引用
  const filesRef = useRef(files);
  filesRef.current = files;

  // 对外暴露获取成功上传的文件列表方法
  const getSuccessFiles = useCallback(() => {
    return filesRef.current.filter(f => f.status === "success").map(f => ({
      name: f.name,
      size: f.size,
      url: f.url,
      type: f.type,
    }));
  }, []);

  // 把方法挂载到window，方便父页面调用（简单实现，也可以用props传递回调）
  useEffect(() => {
    (window as any).getUploadFiles = getSuccessFiles;
    return () => {
      delete (window as any).getUploadFiles;
    };
  }, [getSuccessFiles]);

  return (
    <div className={cn("w-full", className)}>
      {/* 拖拽上传区域 */}
      <div
        {...getRootProps()}
        className={cn(
          "relative w-full rounded-2xl border-2 border-dashed p-8 transition-all duration-200 cursor-pointer text-center",
          isDragActive || isDragging
            ? "border-orange-safety bg-orange-safety/10"
            : "border-white/20 bg-white/5 hover:border-orange-safety/50 hover:bg-white/8",
          files.length >= maxFiles && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <input {...getInputProps()} disabled={files.length >= maxFiles} />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-orange-safety/10 p-4">
            <UploadCloud className="h-8 w-8 text-orange-safety" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {isDragActive ? "松开鼠标上传文件" : "拖拽文件到此处，或点击选择文件"}
            </p>
            <p className="mt-2 text-sm text-steel-400">
              支持 JPG、PNG、GIF、PDF、Word 格式，单个文件不超过 {maxSize / 1024 / 1024}MB，最多 {maxFiles} 个文件
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-orange-safety px-6 py-2.5 text-sm font-bold text-navy-950 shadow-lg shadow-orange-safety/25 transition hover:bg-orange-safetyLight"
          >
            选择文件
          </button>
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div ref={viewerRef} className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="group relative rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
            >
              {/* 删除按钮 */}
              <button
                type="button"
                onClick={() => removeFile(fileItem.id)}
                className="absolute -right-2 -top-2 z-10 rounded-full bg-navy-950/90 p-1.5 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* 文件预览 */}
              <div className="aspect-square w-full overflow-hidden rounded-lg border border-white/5 bg-navy-950/50">
                {isImageFile(fileItem.file) ? (
                  <img
                    data-src={fileItem.preview}
                    src={fileItem.preview}
                    alt={fileItem.name || "图片"}
                    className="h-full w-full cursor-pointer object-cover transition hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                    <File className="h-10 w-10 text-steel-400" />
                    <p className="max-w-full truncate px-2 text-center text-xs text-steel-400">
                      {fileItem.name}
                    </p>
                  </div>
                )}
              </div>

              {/* 上传进度条 */}
              {fileItem.status === "uploading" && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-orange-safety transition-all duration-200"
                    style={{ width: `${fileItem.progress}%` }}
                  />
                </div>
              )}

              {/* 状态提示 */}
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {fileItem.status === "uploading" && (
                  <span className="text-orange-safety">上传中 {Math.round(fileItem.progress)}%</span>
                )}
                {fileItem.status === "success" && (
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircle className="h-3.5 w-3.5" /> 上传成功
                  </span>
                )}
                {fileItem.status === "error" && (
                  <span className="flex items-center gap-1 text-red-500" title={fileItem.error}>
                    <AlertCircle className="h-3.5 w-3.5" /> 上传失败
                  </span>
                )}
              </div>

              {/* 文件大小 */}
              <p className="mt-1 text-xs text-steel-500">
                {(fileItem.size! / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 已上传数量提示 */}
      {files.length > 0 && (
        <p className="mt-4 text-right text-sm text-steel-400">
          已上传 {files.filter(f => f.status === "success").length} / {files.length} 个文件
        </p>
      )}
    </div>
  );
}