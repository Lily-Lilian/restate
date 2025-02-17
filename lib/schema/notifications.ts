import { databases, ID } from "@/lib/appwrite";

export type NotificationType =
  | "application_pending"
  | "application_approved"
  | "application_rejected"
  | "pending_application";

export interface Notification {
  $id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  created_at: string;
}

export const createNotification = async (
  userId: string,
  type: NotificationType,
  message: string
) => {
  try {
    const notification: Omit<Notification, "$id"> = {
      user_id: userId,
      type,
      message,
      read: false,
      created_at: new Date().toISOString(),
    };

    await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
      ID.unique(),
      notification
    );

    console.log("Notification created successfully");
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
