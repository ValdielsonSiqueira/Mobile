import * as SecureStore from 'expo-secure-store';

/**
 * Implementação da camada de Infraestrutura para lidar com Segurança.
 * Usa o Keychain (iOS) e o Keystore (Android) para armazenar dados 
 * sensíveis com criptografia de ponta a ponta em hardware.
 */
export class SecureStorageService {
  /**
   * Salva um dado sensível (token, senha, chaves) criptografado.
   */
  static async saveSecureData(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Erro ao salvar dado seguro:', error);
    }
  }

  /**
   * Recupera um dado sensível criptografado.
   */
  static async getSecureData(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Erro ao recuperar dado seguro:', error);
      return null;
    }
  }

  /**
   * Remove um dado sensível do armazenamento criptografado.
   */
  static async deleteSecureData(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Erro ao deletar dado seguro:', error);
    }
  }
}
