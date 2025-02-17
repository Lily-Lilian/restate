import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "../(root)/(tabs)/profile";
import AddProperty from "../AddProperty";
import AdminDashboard from "../Dashboard";
import { useGlobalContext } from "@/lib/global-provider";
import { useEffect, useState } from "react";
import { SafeAreaView, ActivityIndicator, Text } from "react-native";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import ApplyAgent from "../ApplyAgent";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useGlobalContext();
  const [isAgent, setIsAgent] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingAgentStatus, setCheckingAgentStatus] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_ADMINS_COLLECTION_ID!,
          [Query.equal("email", user.email), Query.equal("role", "super_admin")]
        );
        setIsSuperAdmin(response.documents.length > 0);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsSuperAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const checkAgentStatus = async () => {
      if (!user) {
        setIsAgent(false);
        setCheckingAgentStatus(false);
        return;
      }

      try {
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!,
          [Query.equal("user_id", user.$id), Query.equal("status", "approved")]
        );

        if (response.documents.length > 0) {
          setIsAgent(true);
        } else {
          setIsAgent(false);
        }
      } catch (error) {
        console.error("Error checking agent status:", error);
        setIsAgent(false);
      } finally {
        setCheckingAgentStatus(false);
      }
    };

    checkAgentStatus();
  }, [user]);

  if (checkingAgentStatus) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0066FF" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={Profile} />
      {isAgent && <Stack.Screen name="AddProperty" component={AddProperty} />}
      {!isAgent && <Stack.Screen name="ApplyAgent" component={ApplyAgent} />}
      {isSuperAdmin && (
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
