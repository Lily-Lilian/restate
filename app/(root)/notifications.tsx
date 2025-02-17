import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Notification } from "@/lib/schema/notifications";
import { useRouter } from "expo-router";
import { Redirect, Slot, Stack } from "expo-router";
import { Query } from "appwrite";

const NotificationsScreen = () => {
  const { user } = useGlobalContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_ADMINS_COLLECTION_ID!,
        [Query.equal("email", user?.email || "")]
      );
      const isAdmin = response.documents.length > 0;
      setIsAdmin(isAdmin);
      fetchNotifications(isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const fetchNotifications = async (adminStatus: boolean) => {
    try {
      let queries = [];

      if (adminStatus) {
        // Admin sees all pending applications as notifications
        const pendingApplications = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!,
          [Query.equal("status", "pending")]
        );
        // Convert pending applications to notifications
        const adminNotifications = pendingApplications.documents.map((app) => ({
          $id: app.$id,
          user_id: "admin",
          type: "pending_application" as const,
          message: `New agent application from ${app.name || "Unknown"}`,
          read: false,
          created_at: app.$createdAt,
        }));

        setNotifications(adminNotifications);
      } else {
        // Regular users see their own notifications
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
          [Query.equal("user_id", user?.$id || "")]
        );
        // Map the documents to ensure they match the Notification type
        const userNotifications = response.documents.map((doc) => ({
          $id: doc.$id,
          user_id: doc.user_id,
          type: doc.type,
          message: doc.message,
          read: doc.read,
          created_at: doc.created_at,
        }));
        setNotifications(userNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        <Text className="text-2xl font-bold my-6">Notifications</Text>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.$id}
            onPress={() => {
              if (isAdmin && notification.type === "pending_application") {
                router.push("/admin" as any);
              }
            }}
            className="p-4 mb-4 border-b bg-blue-50"
          >
            <Text className="text-lg">{notification.message}</Text>
            <Text className="text-gray-500">
              {new Date(notification.created_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
        {notifications.length === 0 && (
          <Text className="text-gray-500 text-center">No notifications</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
