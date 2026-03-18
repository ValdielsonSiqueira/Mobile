import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

interface UploadReceiptResult {
  url: string;
  path: string;
}

export function useUploadReceipt() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Faz upload de um arquivo (uri local) para Firebase Storage.
   * @param uri        - URI local do arquivo (expo-document-picker / expo-image-picker)
   * @param userId     - UID do usuário autenticado
   * @param fileName   - Nome desejado para o arquivo no storage
   */
  const upload = useCallback(
    async (uri: string, userId: string, fileName: string): Promise<UploadReceiptResult> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Converte URI local em Blob (Método recomendado para Firebase + RN/Expo)
        const blob = await new Promise<Blob>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function (e) {
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", uri, true);
          xhr.send(null);
        });

        const storagePath = `users/${userId}/receipts/${Date.now()}_${fileName}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        return await new Promise<UploadReceiptResult>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setProgress(pct);
            },
            (err) => {
              setError(err.message);
              reject(err);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url, path: storagePath });
            }
          );
        });
      } catch (e: any) {
        setError(e.message ?? 'Erro no upload.');
        throw e;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  /** Remove um arquivo do Storage pelo path completo */
  const remove = useCallback(async (storagePath: string) => {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  }, []);

  return { upload, remove, uploading, progress, error };
}
