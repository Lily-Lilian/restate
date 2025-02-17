import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useNavigation } from "@react-navigation/native";
import { ID, Query} from "appwrite";

interface AgentApplication {
  $id: string;
  name: string;
  email: string;
  avatar: string;
  user_id: string;
  status: string;
  experience: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { user } = useGlobalContext();
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_ADMINS_COLLECTION_ID!,
        [Query.equal("email", "kaelalson58@gmail.com")]
      );
      console.log("Admin check response:", response);
      setIsAdmin(response.documents.length > 0);
    } catch (error: any) {
      console.error("Error checking admin status:", error);
      console.error("Error details:", error.message, error.code);
      setIsAdmin(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!
      );
      setApplications(response.documents as unknown as AgentApplication[]);
    } catch (error) {
      console.error("Error fetching applications:", error);
      Alert.alert("Error", "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      // Update application status
      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!,
        applicationId,
        { status: newStatus }
      );

      // Create notification for the user
      await databases.createDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
        ID.unique(),
        {
          user_id: applicationId,
          type: `application_${newStatus}`,
          message:
            newStatus === "approved"
              ? "Congratulations! Your agent application has been approved. You can now start adding properties."
              : "Your agent application has been rejected.",
          read: false,
          created_at: new Date().toISOString(),
        }
      );

      // Refresh the applications list
      fetchApplications();

      Alert.alert(
        "Success",
        `Application ${
          newStatus === "approved" ? "approved" : "rejected"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating application:", error);
      Alert.alert("Error", "Failed to update application status");
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-red-600">
          You don't have access to this page
        </Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0066FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold mb-6">Agent Applications</Text>

          {applications.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No applications found
            </Text>
          ) : (
            applications.map((application) => (
              <View
                key={application.$id}
                className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="font-semibold text-lg">
                      {application.name}
                    </Text>
                    <Text className="text-gray-600">{application.email}</Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      application.status === "pending"
                        ? "bg-yellow-100"
                        : application.status === "approved"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`capitalize ${
                        application.status === "pending"
                          ? "text-yellow-800"
                          : application.status === "approved"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {application.status}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-600 mb-4">
                  Experience: {application.experience} years
                </Text>

                {application.status === "pending" && (
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateStatus(application.$id, "approved")
                      }
                      className="flex-1 bg-green-500 py-2 rounded-lg"
                    >
                      <Text className="text-white text-center font-semibold">
                        Approve
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateStatus(application.$id, "rejected")
                      }
                      className="flex-1 bg-red-500 py-2 rounded-lg"
                    >
                      <Text className="text-white text-center font-semibold">
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
