import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Query } from "appwrite";

import { databases, account } from "@/lib/appwrite";
import icons from "@/constants/icons";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const BOOKINGS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID;

interface Booking {
  $id: string;
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  notes: string;
  status: string;
  user_email: string;
  created_at: string;
  property_name: string;
  property_image: string;
  total_price: string;
}

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const currentUser = await account.get();
      const response = await databases.listDocuments(
        DATABASE_ID!,
        BOOKINGS_COLLECTION_ID!,
        [Query.equal("user_id", currentUser.$id), Query.orderDesc("created_at")]
      );
      setBookings(response.documents as unknown as Booking[]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID!,
        BOOKINGS_COLLECTION_ID!,
        bookingId,
        {
          status: "cancelled",
        }
      );
      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#006FFD" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        {/* Header with proper top padding */}
        <View className="flex-row items-center px-5 py-4 border-b border-primary-200">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={icons.backArrow} className="size-6" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-rubik-bold">
            My Bookings
          </Text>
        </View>

        {/* Bookings List */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {bookings.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10">
              <Image
                source={icons.calendar}
                className="size-16 mb-4"
                style={{ opacity: 0.5 }}
              />
              <Text className="text-black-200 text-center">
                No bookings found. Start exploring properties to make your first
                booking!
              </Text>
            </View>
          ) : (
            bookings.map((booking) => (
              <View
                key={booking.$id}
                className="bg-white rounded-2xl p-4 mb-4 border border-primary-200 shadow-sm"
              >
                {/* Property Image and Name */}
                <View className="flex-row mb-4">
                  <Image
                    source={{ uri: booking.property_image }}
                    className="w-20 h-20 rounded-lg"
                  />
                  <View className="flex-1 ml-4">
                    <Text className="font-rubik-bold text-lg mb-1">
                      {booking.property_name}
                    </Text>
                    <View className="flex-row items-center">
                      <View
                        className={`px-3 py-1 rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        <Text className="font-rubik-medium capitalize">
                          {booking.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Booking Details */}
                <View className="border-t border-primary-200 pt-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-black-200">Check-in</Text>
                    <Text className="font-rubik-medium">
                      {formatDate(booking.check_in)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-black-200">Check-out</Text>
                    <Text className="font-rubik-medium">
                      {formatDate(booking.check_out)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-black-200">Guests</Text>
                    <Text className="font-rubik-medium">{booking.guests}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-black-200">Total Price</Text>
                    <Text className="font-rubik-bold text-primary-300">
                      ${booking.total_price}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {booking.status.toLowerCase() === "pending" && (
                  <View className="flex-row justify-end mt-4 pt-4 border-t border-primary-200">
                    <TouchableOpacity
                      onPress={() => handleCancelBooking(booking.$id)}
                      className="px-4 py-2 rounded-full border border-red-500"
                    >
                      <Text className="text-red-500 font-rubik-medium">
                        Cancel Booking
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MyBookingsScreen;
