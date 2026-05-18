import { useRouter, useSegments } from "expo-router";
import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { SecureStorageService } from "../infrastructure/security/SecureStorageService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);

      if (firebaseUser) {
        await SecureStorageService.saveSecureData(
          "SECURE_USER_SESSION_UID",
          firebaseUser.uid,
        );
        if (firebaseUser.email) {
          await SecureStorageService.saveSecureData(
            "SECURE_USER_SESSION_EMAIL",
            firebaseUser.email,
          );
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, segments, isLoading]);

  const signOut = async () => {
    await SecureStorageService.deleteSecureData("SECURE_USER_SESSION_UID");
    await SecureStorageService.deleteSecureData("SECURE_USER_SESSION_EMAIL");

    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
