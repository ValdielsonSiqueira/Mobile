import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { translateFirebaseError } from '../../utils/firebaseErrors';

/**
 * Camada de Serviço (Infraestrutura/Aplicação) para lidar com a Autenticação.
 * Encapsula a comunicação com o provedor externo (Firebase) e traduz erros 
 * de infraestrutura para mensagens de domínio legíveis pela camada de visualização.
 */
export class AuthService {
  static async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(translateFirebaseError(error.code));
    }
  }

  static async register(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(translateFirebaseError(error.code));
    }
  }
}
