import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { getCurrentUser } from "./appwrite";
import { useAppwrite } from "./useAppwrite";
import { Redirect } from "expo-router";
import { databases } from "./appwrite";
import { Query } from "appwrite";

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
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
  isAgent: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [verifiedEmail, setVerifiedEmail] = React.useState<string | null>(null);
  const [isAgent, setIsAgent] = useState<boolean>(false);

  const isLogged = !!user;

  useEffect(() => {
    const fetchUserAndAgentStatus = async () => {
      if (user) {
        try {
          const response = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!,
            [
              Query.equal("user_id", user.$id),
              Query.equal("status", "approved"),
            ]
          );

          if (response.documents.length > 0) {
            setIsAgent(true);
          } else {
            setIsAgent(false);
          }
        } catch (error) {
          console.error("Error fetching agent status:", error);
          setIsAgent(false);
        }
      } else {
        setIsAgent(false);
      }
    };

    fetchUserAndAgentStatus();
  }, [user]);

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
        isAgent,
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
