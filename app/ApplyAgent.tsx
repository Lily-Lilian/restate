import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { databases, ID, avatar } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Query } from "appwrite";
import { useRouter } from "expo-router";

interface AgentApplication {
  name: string;
  email: string;
  avatar: string;
  user_id: string;
  status: string;
  experience: string;
}

interface FormError {
  experience?: string;
}

const ApplyForAgent: React.FC = () => {
  const { user } = useGlobalContext();
  const [experience, setExperience] = useState<string>("");
  const [error, setError] = useState<FormError>({});
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] =
    useState<AgentApplication | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkExistingApplication();
  }, [user]);

  const checkExistingApplication = async () => {
    if (!user) return;

    try {
      setCheckingStatus(true);
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!,
        [Query.equal("user_id", user.$id)]
      );
      if (response.documents.length > 0) {
        const doc = response.documents[0];
        const application: AgentApplication = {
          name: doc.name,
          email: doc.email,
          avatar: doc.avatar,
          user_id: doc.user_id,
          status: doc.status,
          experience: doc.experience,
        };
        setExistingApplication(application);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const getAvatarUrl = () => {
    if (!user?.name) return null;
    try {
      return avatar.getInitials(user.name).toString();
    } catch (error) {
      console.error("Error generating avatar:", error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    const newError: FormError = {};

    if (!experience.trim()) {
      newError.experience = "Experience is required";
    } else if (isNaN(Number(experience)) || Number(experience) < 0) {
      newError.experience = "Please enter a valid number of years";
    }

    setError(newError);
    return Object.keys(newError).length === 0;
  };

  const handleApply = async () => {
    if (!user) {
      Alert.alert("Authentication Error", "Please sign in to continue.");
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);
      const userAvatarUrl = getAvatarUrl();

      if (!userAvatarUrl) {
        throw new Error("Failed to generate avatar");
      }

      // Create agent application
      const applicationData = {
        name: user.name,
        email: user.email,
        avatar: userAvatarUrl,
        user_id: user.$id,
        status: "pending",
        experience: experience.trim(),
      };

      await databases.createDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!,
        ID.unique(),
        applicationData
      );

      // Create notification for admin
      await databases.createDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
        ID.unique(),
        {
          user_id: "super_admin",
          type: "application_pending",
          message: `New agent application from ${user.name}`,
          read: false,
          created_at: new Date().toISOString(),
        }
      );

      await checkExistingApplication();
      Alert.alert(
        "Application Submitted",
        "Your application is under review. We'll notify you once approved.",
        [
          {
            text: "OK",
            onPress: () => router.push("/"),
          },
        ]
      );
    } catch (error) {
      console.error("Error applying:", error);
      Alert.alert("Error", "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderApplicationStatus = () => {
    if (!existingApplication) return null;

    const statusColors = {
      pending: "bg-yellow-50 border-yellow-200",
      approved: "bg-green-50 border-green-200",
      rejected: "bg-red-50 border-red-200",
    };

    const statusTextColors = {
      pending: "text-yellow-800",
      approved: "text-green-800",
      rejected: "text-red-800",
    };

    const statusMessages = {
      pending: "Your application is currently under review",
      approved: "Congratulations! Your application has been approved",
      rejected: "Unfortunately, your application was not approved at this time",
    };

    return (
      <View
        className={`p-6 rounded-2xl border ${
          statusColors[existingApplication.status as keyof typeof statusColors]
        }`}
      >
        <View className="flex-row items-center mb-3">
          <Text className="text-lg font-semibold mr-2">
            {existingApplication.status === "pending" ? "⏳" : "✅"}
          </Text>
          <Text
            className={`text-lg font-semibold ${
              statusTextColors[
                existingApplication.status as keyof typeof statusTextColors
              ]
            }`}
          >
            Application Status
          </Text>
        </View>

        <Text
          className={`text-base ${
            statusTextColors[
              existingApplication.status as keyof typeof statusTextColors
            ]
          }`}
        >
          {
            statusMessages[
              existingApplication.status as keyof typeof statusMessages
            ]
          }
        </Text>

        <View className="mt-4 space-y-2">
          <Text className="text-gray-600">
            Submitted Experience: {existingApplication.experience} years
          </Text>
          <Text className="text-gray-600">
            Email: {existingApplication.email}
          </Text>
        </View>
      </View>
    );
  };

  if (checkingStatus) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0066FF" />
        <Text className="mt-4 text-gray-600">
          Checking application status...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Single Back Button */}
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        className="p-4"
      >
        <Image
          source={require("@/assets/icons/back-arrow.png")}
          className="w-6 h-6"
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="mt-4 mb-6">
            <View className="flex-row items-center space-x-4 mb-6">
              {user && (
                <View className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 shadow-sm">
                  <Image
                    source={{ uri: getAvatarUrl() || undefined }}
                    className="w-full h-full"
                    defaultSource={require("@/assets/images/avatar.png")}
                  />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-2xl font-rubik-bold text-[#1B1B1B] leading-tight">
                  Become a Real Estate Agent
                </Text>
                <Text className="text-[#6B7280] mt-1 font-medium">
                  {user?.name || "Welcome"}
                </Text>
              </View>
            </View>
          </View>

          {existingApplication ? (
            renderApplicationStatus()
          ) : (
            <>
              <View className="bg-blue-50 p-4 rounded-xl mb-6">
                <Text className="text-blue-800 font-medium">
                  Join our network of professional real estate agents and start
                  listing properties today.
                </Text>
              </View>

              {/* Form Section */}
              <View className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Application Details
                </Text>

                <View className="space-y-2 mb-2">
                  <Text className="text-sm font-medium text-gray-700">
                    Email
                  </Text>
                  <View className="bg-gray-100 p-4 rounded-lg">
                    <Text className="text-gray-600">
                      {user?.email || "Not available"}
                    </Text>
                  </View>
                </View>

                <View className="space-y-2 mb-6">
                  <Text className="text-sm font-medium text-gray-700">
                    Years of Experience
                  </Text>
                  <TextInput
                    placeholder="Enter your years of experience"
                    value={experience}
                    onChangeText={setExperience}
                    keyboardType="numeric"
                    className={`border rounded-lg p-4 bg-white ${
                      error.experience
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />
                  {error.experience && (
                    <Text className="text-red-500 text-sm mt-1">
                      {error.experience}
                    </Text>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleApply}
                  disabled={loading}
                  className={`
                    ${loading ? "bg-blue-400" : "bg-blue-600"}
                    rounded-xl py-4 shadow-sm
                  `}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-semibold text-white text-center">
                      Submit Application
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Info Text */}
                <View className="mt-6 bg-gray-100 p-4 rounded-lg">
                  <Text className="text-sm text-gray-600 text-center">
                    Applications are typically reviewed within 24-48 hours.
                    You'll receive an email notification once your application
                    is processed.
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ApplyForAgent;