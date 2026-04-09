import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ACCEPTED_FORMATS = {
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/mp4': ['.m4a'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
};

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

interface FileUploaderProps {
  onFileSelect: (file: File, title: string) => void;
  uploading?: boolean;
  progress?: number;
  onCancel?: () => void;
}

export default function FileUploader({ onFileSelect, uploading, progress, onCancel }: FileUploaderProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted: File[], rejected: unknown[]) => {
    setError('');
    if (rejected.length > 0) {
      setError('지원하지 않는 파일 형식이거나 파일 크기가 500MB를 초과합니다.');
      return;
    }
    if (accepted[0]) setSelectedFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const handleSubmit = () => {
    if (!selectedFile) { setError('파일을 선택해주세요.'); return; }
    if (!title.trim()) { setError('강의 제목을 입력해주세요.'); return; }
    onFileSelect(selectedFile, title.trim());
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">🎙️</div>
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? '여기에 파일을 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
        </p>
        <p className="text-xs text-gray-400 mt-1">mp3, wav, mp4, m4a, webm · 최대 500MB</p>
        {selectedFile && (
          <p className="mt-3 text-sm text-indigo-600 font-medium">{selectedFile.name}</p>
        )}
      </div>

      <input
        type="text"
        placeholder="강의 제목을 입력하세요 (필수)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {uploading && progress !== undefined ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>업로드 중...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {onCancel && (
            <button onClick={onCancel} className="text-sm text-red-500 hover:underline">
              취소
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || !title.trim()}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          업로드 시작
        </button>
      )}
    </div>
  );
}
