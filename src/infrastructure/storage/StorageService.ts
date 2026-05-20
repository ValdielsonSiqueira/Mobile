import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../firebase/config';

export interface UploadReceiptResult {
  url: string;
  path: string;
}

/**
 * Camada de Serviço (Infraestrutura) para lidar com o Armazenamento de Arquivos.
 * Isola a dependência do Firebase Storage da camada de apresentação (hooks e UI).
 */
export class StorageService {
  /**
   * Faz upload de um arquivo para o Storage e emite progresso.
   * 
   * @param uri URI do arquivo
   * @param userId ID do usuário autenticado
   * @param fileName Nome original do arquivo
   * @param onProgress Callback de progresso (0 a 100)
   * @returns URL de download e Caminho no Storage
   */
  static async uploadReceipt(
    uri: string,
    userId: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadReceiptResult> {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
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
          if (onProgress) {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(pct);
          }
        },
        (err) => {
          reject(err);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url, path: storagePath });
        }
      );
    });
  }

  /**
   * Remove um arquivo do Storage.
   * 
   * @param storagePath Caminho do arquivo a ser deletado
   */
  static async deleteReceipt(storagePath: string): Promise<void> {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  }
}
