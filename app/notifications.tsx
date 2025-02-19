import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databases } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Notification } from '@/lib/schema/notifications';
import { useRouter } from 'expo-router';
import { ID, Query } from 'appwrite';
import icons from '@/constants/icons';

const NotificationsScreen = () => {
  const { user, isAgent } = useGlobalContext();
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
        [Query.equal('email', user?.email || '')]
      );
      const isAdmin = response.documents.length > 0;
      setIsAdmin(isAdmin);
      fetchNotifications(isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
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
          [Query.equal('status', 'pending')]
        );
        // Convert pending applications to notifications
        const adminNotifications = pendingApplications.documents.map((app) => ({
          $id: app.$id,
          user_id: 'admin',
          type: 'pending_application' as const,
          message: `New agent application from ${app.name || 'Unknown'}`,
          read: false,
          created_at: app.$createdAt,
        }));

        setNotifications(adminNotifications);
      } else if (isAgent) {
        const pendingApplications = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID!,
          [Query.equal('agent_id', user!.$id)]
        );

        const adminNotifications = pendingApplications.documents.map((app) => ({
          ...app,
          user_id: app.user_id,
          type: 'pending_property' as const,
          message: `${
            app.user_email
          } would like to book your property from ${format(
            app.check_in,
            'E - MMM dd, yyyy'
          )} up to ${format(app.check_out, 'E - MMM dd, yyyy')}`,
          read: false,
          created_at: app.$createdAt,
        }));

        setNotifications(adminNotifications);
      } else {
        // Regular users see their own notifications
        const response = await databases.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
          [Query.equal('user_id', user?.$id || '')]
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
      console.error('Error fetching notifications:', error);
    }
  };

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: string,
    property_id: string
  ) => {
    try {
      // Update application status
      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID!,
        applicationId,
        { status: newStatus }
      );

      // Update property to booked
      if (newStatus === 'approved')
        await databases.updateDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID!,
          property_id,
          { booked: true }
        );

      // Refresh the applications list
      checkAdminStatus();

      Alert.alert('Success', `Booking ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating application:', error);
      Alert.alert('Error', 'Failed to update application status');
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView className='flex-1 px-4'>
        <View className='flex-row items-center px-5 py-4 border-b border-primary-200 bg-white'>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={icons.backArrow} className='size-6' />
          </TouchableOpacity>
          <Text className='flex-1 text-center text-xl font-rubik-bold'>
            Notifications
          </Text>
        </View>
        {notifications.map((notification) =>
          notification.type !== 'pending_property' ? (
            <TouchableOpacity
              key={notification.$id}
              onPress={() => {
                if (isAdmin && notification.type === 'pending_application') {
                  router.push('/admin' as any);
                }
              }}
              className='p-4 mb-4 border-b bg-blue-50'
            >
              <Text className='text-lg'>{notification.message}</Text>
              <Text className='text-gray-500'>
                {new Date(notification.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              key={notification.$id}
              className='bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100'
            >
              <View className='flex-row justify-between items-start mb-3'>
                <View>
                  <Text className='font-semibold text-lg'>
                    {notification.property_name}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    notification.status === 'pending'
                      ? 'bg-yellow-100'
                      : notification.status === 'approved'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}
                >
                  <Text
                    className={`capitalize ${
                      notification.status === 'pending'
                        ? 'text-yellow-800'
                        : notification.status === 'approved'
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}
                  >
                    {notification.status || 'rejected'}
                  </Text>
                </View>
              </View>
              <View>
                <Text className='font-semibold text-lg'>
                  {notification.message}
                </Text>
              </View>

              {notification.status === 'pending' && (
                <View className='flex-row space-x-2'>
                  <TouchableOpacity
                    onPress={() =>
                      handleUpdateStatus(
                        notification.$id,
                        'approved',
                        notification.property_id!
                      )
                    }
                    className='flex-1 bg-green-500 py-2 rounded-lg'
                  >
                    <Text className='text-white text-center font-semibold'>
                      Approve
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleUpdateStatus(
                        notification.$id,
                        'rejected',
                        notification.property_id!
                      )
                    }
                    className='flex-1 bg-red-500 py-2 rounded-lg'
                  >
                    <Text className='text-white text-center font-semibold'>
                      Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        )}
        {notifications.length === 0 && (
          <Text className='text-gray-500 text-center'>No notifications</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
