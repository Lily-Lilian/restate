import React, { createContext, useContext, ReactNode } from "react";
import { getCurrentUser } from "./appwrite";
import { useAppwrite } from "./useAppwrite";
import { Redirect } from "expo-router";

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

interface GlobalContextType {
  isLogged: boolean;
  user: User | null;
  loading: boolean;
  refetch: () => void;
  isEmailVerified: boolean;
  verifiedEmail: string | null;
  setIsEmailVerified: (status: boolean) => void;
  setVerifiedEmail: (email: string | null) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [verifiedEmail, setVerifiedEmail] = React.useState<string | null>(null);

  const isLogged = !!user;

  return (
      <GlobalContext.Provider
          value={{
            isLogged,
            user,
            loading,
            refetch,
            isEmailVerified,
            verifiedEmail,
            setIsEmailVerified,
            setVerifiedEmail,
          }}
      >
        {children}
      </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};

// Hook to protect routes that require authentication
export const useRequireAuth = () => {
  const { isLogged, loading } = useGlobalContext();

  if (!loading && !isLogged) {
    return <Redirect href="/sign-in" />;
  }

  return null;
};

export default GlobalProvider;