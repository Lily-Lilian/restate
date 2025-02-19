import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { ID, Query } from 'appwrite';

import { useAppwrite } from '@/lib/useAppwrite';
import { getPropertyById, databases, account, functions } from '@/lib/appwrite';
import icons from '@/constants/icons';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const BOOKINGS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID;

const BookingScreen = () => {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingDate, setSelectingDate] = useState<'checkIn' | 'checkOut'>(
    'checkIn'
  );
  const [guests, setGuests] = useState('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);

  // Fetch property data
  const { data: property } = useAppwrite({
    fn: getPropertyById,
    params: {
      id: propertyId!,
    },
  });

  // Check for existing booking
  const checkExistingBooking = async () => {
    try {
      const currentUser = await account.get();
      const response = await databases.listDocuments(
        DATABASE_ID!,
        BOOKINGS_COLLECTION_ID!,
        [
          Query.equal('property_id', propertyId!),
          Query.equal('user_id', currentUser.$id),
          Query.equal('status', 'pending'),
        ]
      );

      setHasExistingBooking(response.documents.length > 0);
      return response.documents.length > 0;
    } catch (error) {
      console.error('Error checking existing booking:', error);
      return false;
    }
  };

  // Add this useEffect to check on component mount
  useEffect(() => {
    checkExistingBooking();
  }, [propertyId]);

  // Handle date selection in calendar
  const handleDateSelect = (date: string) => {
    const selectedDate = new Date(date);
    if (selectingDate === 'checkIn') {
      setCheckIn(selectedDate);
      setSelectingDate('checkOut');
    } else {
      setCheckOut(selectedDate);
      setShowCalendar(false);
    }
  };

  const sendBookingConfirmationEmail = async (bookingData: any) => {
    try {
      const functionId = '67ab163b0380de12514f';
      console.log('Starting email send with function ID:', functionId);

      const result = await functions.createExecution(
        functionId,
        JSON.stringify({
          userEmail: bookingData.user_email,
          propertyName: bookingData.property_name,
          checkIn: formatDate(bookingData.check_in),
          checkOut: formatDate(bookingData.check_out),
          guests: bookingData.guests,
          totalPrice: bookingData.total_price,
        })
      );

      console.log('Email function execution result:', result);
    } catch (error) {
      // Log detailed error but don't throw
      console.error('Email sending error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
      });
      // Don't throw the error - let the booking continue
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleBooking = async () => {
    try {
      setIsSubmitting(true);

      // Check for existing booking before proceeding
      const hasBooking = await checkExistingBooking();

      if (hasBooking) {
        alert('You already have a pending booking for this property!');
        return;
      }

      if (!propertyId || !checkIn || !checkOut || !guests) {
        alert('Please fill in all required fields');
        return;
      }

      if (checkOut <= checkIn) {
        alert('Check-out date must be after check-in date');
        return;
      }

      const currentUser = await account.get();
      const bookingData = {
        property_id: propertyId,
        user_id: currentUser.$id,
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        guests: parseInt(guests),
        notes,
        status: 'pending',
        user_email: currentUser.email,
        created_at: new Date().toISOString(),
        property_name: property?.name,
        property_image: property?.image,
        agent_id: property?.agent.user_id,
        total_price: (
          property?.price *
          Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          )
        ).toString(),
      };

      // Create booking document
      await databases.createDocument(
        DATABASE_ID!,
        BOOKINGS_COLLECTION_ID!,
        ID.unique(),
        bookingData
      );

      // Send confirmation email silently
      try {
        await sendBookingConfirmationEmail(bookingData);
      } catch (error) {
        // Log error but don't show to user
        console.error('Email sending failed:', error);
        // Continue with booking confirmation
      }

      // Show success and navigate
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        router.back();
      }, 2000);
    } catch (error) {
      // Log detailed error to console
      console.error('Booking failed:', error);
      // Show generic error to user
      alert('Unable to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        {/* Header with proper top padding */}
        <View className='flex-row items-center px-5 py-4 border-b border-primary-200 bg-white'>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={icons.backArrow} className='size-6' />
          </TouchableOpacity>
          <Text className='flex-1 text-center text-xl font-rubik-bold'>
            Book Property
          </Text>
        </View>

        {/* Main Content */}
        <ScrollView
          className='flex-1 px-5'
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Add warning message if there's an existing booking */}
          {hasExistingBooking && (
            <View className='mt-6 bg-yellow-100 p-4 rounded-xl'>
              <Text className='text-yellow-700 font-rubik-medium text-center'>
                You already have a pending booking for this property
              </Text>
            </View>
          )}

          {/* Property Details Card */}
          <View className='mt-6 bg-white rounded-2xl p-5 shadow-sm border border-primary-100'>
            <Text className='text-lg font-rubik-bold mb-2'>
              Property Details
            </Text>
            <Text className='font-rubik-medium text-lg'>{property?.name}</Text>
            <Text className='text-black-200 mb-2'>{property?.address}</Text>
            <View className='flex-row items-center'>
              <Text className='text-primary-300 font-rubik-bold text-xl'>
                ${property?.price}
              </Text>
              <Text className='text-black-200 ml-1'>/night</Text>
            </View>
          </View>

          {/* Booking Details Section */}
          <View className='mt-6'>
            <Text className='text-lg font-rubik-bold mb-4'>
              Booking Details
            </Text>

            {/* Date Selection */}
            <View className='flex-row gap-4 mb-4'>
              <TouchableOpacity
                onPress={() => {
                  setSelectingDate('checkIn');
                  setShowCalendar(true);
                }}
                className='flex-1 border border-primary-200 rounded-2xl p-4 bg-white shadow-sm'
              >
                <Text className='text-black-200 text-sm mb-1'>Check-in</Text>
                <Text className='font-rubik-medium'>
                  {checkIn.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSelectingDate('checkOut');
                  setShowCalendar(true);
                }}
                className='flex-1 border border-primary-200 rounded-2xl p-4 bg-white shadow-sm'
              >
                <Text className='text-black-200 text-sm mb-1'>Check-out</Text>
                <Text className='font-rubik-medium'>
                  {checkOut.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Guests Input */}
            <View className='bg-white border border-primary-200 rounded-2xl p-4 mb-4 shadow-sm'>
              <Text className='text-black-200 text-sm mb-1'>
                Number of Guests
              </Text>
              <TextInput
                value={guests}
                onChangeText={setGuests}
                keyboardType='numeric'
                className='font-rubik-medium text-base'
                placeholder='Enter number of guests'
              />
            </View>

            {/* Notes Input */}
            <View className='bg-white border border-primary-200 rounded-2xl p-4 mb-4 shadow-sm'>
              <Text className='text-black-200 text-sm mb-1'>
                Additional Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                className='font-rubik-medium text-base'
                placeholder='Any special requests or notes?'
                textAlignVertical='top'
              />
            </View>

            {/* Price Summary */}
            <View className='bg-white border border-primary-200 rounded-2xl p-4 mb-4 shadow-sm'>
              <Text className='text-black-200 text-sm mb-2'>Price Summary</Text>
              <View className='flex-row justify-between mb-2'>
                <Text className='font-rubik-medium'>Price per night</Text>
                <Text className='font-rubik-bold'>${property?.price}</Text>
              </View>
              <View className='flex-row justify-between mb-2'>
                <Text className='font-rubik-medium'>Number of nights</Text>
                <Text className='font-rubik-bold'>
                  {Math.ceil(
                    (checkOut.getTime() - checkIn.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </Text>
              </View>
              <View className='border-t border-primary-200 mt-2 pt-2'>
                <View className='flex-row justify-between'>
                  <Text className='font-rubik-bold'>Total</Text>
                  <Text className='font-rubik-bold text-primary-300'>
                    $
                    {property?.price *
                      Math.ceil(
                        (checkOut.getTime() - checkIn.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 20,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#eee',
          }}
        >
          <TouchableOpacity
            onPress={handleBooking}
            disabled={isSubmitting || hasExistingBooking}
            style={{
              backgroundColor: hasExistingBooking ? '#ccc' : '#006FFD',
              padding: 15,
              borderRadius: 25,
            }}
          >
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              {isSubmitting
                ? 'Processing...'
                : hasExistingBooking
                ? 'Already Booked'
                : 'Confirm Booking'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Modal */}
        <Modal visible={showCalendar} transparent={true} animationType='slide'>
          <View className='flex-1 bg-black/50 justify-end'>
            <View className='bg-white rounded-t-3xl p-5'>
              <View className='flex-row justify-between items-center mb-4'>
                <Text className='text-lg font-rubik-bold'>
                  Select{' '}
                  {selectingDate === 'checkIn' ? 'Check-in' : 'Check-out'} Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCalendar(false)}
                  className='p-2'
                >
                  <Text className='text-primary-300 font-rubik-bold'>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>

              <Calendar
                minDate={
                  selectingDate === 'checkIn'
                    ? new Date().toISOString()
                    : checkIn.toISOString()
                }
                onDayPress={(day: DateData) => handleDateSelect(day.dateString)}
                markedDates={{
                  [checkIn.toISOString().split('T')[0]]: {
                    selected: true,
                    startingDay: true,
                  },
                  [checkOut.toISOString().split('T')[0]]: {
                    selected: true,
                    endingDay: true,
                  },
                }}
                theme={{
                  selectedDayBackgroundColor: '#006FFD',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#006FFD',
                  arrowColor: '#006FFD',
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmation}
          transparent={true}
          animationType='fade'
        >
          <View className='flex-1 bg-black/50 justify-center items-center'>
            <View className='bg-white rounded-3xl p-6 m-5 items-center'>
              <View className='bg-primary-100 rounded-full p-4 mb-4'>
                <Image
                  source={icons.check}
                  className='size-8'
                  tintColor='#006FFD'
                />
              </View>
              <Text className='text-xl font-rubik-bold mb-2 text-center'>
                Booking Submitted!
              </Text>
              <Text className='text-black-200 text-center mb-4'>
                Check your email for booking confirmation and details.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmation(false);
                  router.push('./MyBookings');
                }}
                className='bg-primary-300 py-3 px-6 rounded-full w-full'
              >
                <Text className='text-white text-center font-rubik-bold'>
                  View My Bookings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default BookingScreen;
