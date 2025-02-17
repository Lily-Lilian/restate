import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { databases } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icons";
import { Notification } from "@/lib/schema/notifications";
import { router, useRouter } from "expo-router";
import { Query } from "appwrite";

export const NotificationBell = () => {
  const navigation = useRouter();
  const { user } = useGlobalContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

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
        [Query.equal("email", user?.email ?? "")]
      );
      const adminStatus = response.documents.length > 0;
      setIsAdmin(adminStatus);
      fetchUnreadCount(adminStatus);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const fetchUnreadCount = async (adminStatus: boolean) => {
    try {
      if (adminStatus) {
        // Get count of pending applications for admin
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID!,
          [Query.equal("status", "pending")]
        );
        setUnreadCount(response.documents.length);
      } else {
        // Get regular unread notifications count
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
          [Query.equal("user_id", user?.$id ?? ""), Query.equal("read", false)]
        );
        setUnreadCount(response.documents.length);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(
          isAdmin ? "/admin/Dashboard" : ("/notifications" as any)
        )
      }
      className="mr-4"
    >
      <Text className="text-2xl">🔔</Text>
      {unreadCount > 0 && (
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
          <Text className="text-white text-xs">{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
