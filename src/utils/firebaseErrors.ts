export function translateFirebaseError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'E-mail ou senha incorretos. Verifique seus dados.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Crie uma conta primeiro.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso por outra conta.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Escolha uma com pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas falhas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
