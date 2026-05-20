import { useCallback, useState } from 'react';
import { StorageService, UploadReceiptResult } from '../infrastructure/storage/StorageService';

export function useUploadReceipt() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (uri: string, userId: string, fileName: string): Promise<UploadReceiptResult> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const result = await StorageService.uploadReceipt(
          uri, 
          userId, 
          fileName, 
          (pct) => setProgress(pct)
        );
        return result;
      } catch (e: any) {
        setError(e.message ?? 'Erro no upload.');
        throw e;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const remove = useCallback(async (storagePath: string) => {
    await StorageService.deleteReceipt(storagePath);
  }, []);

  return { upload, remove, uploading, progress, error };
}
