// import React from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
// } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import icons from "@/constants/icons";
// import { useAppwrite } from "@/lib/useAppwrite";
// import { getPropertyById } from "@/lib/appwrite";
// import { sendEmail } from "@/lib/emailService";
//
// const BookingScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//
//
//  // useRoute const { data: property } = useAppwrite({
//  //    fn: getPropertyById,
//  //    params: {
//  //      id: propertyId,
//  //    },
//  //  });
//
//   const handleConfirmBooking = async () => {
//     // Logic to handle booking confirmation
//     alert("Booking confirmed!");
//
//     // Send confirmation email
//     const emailDetails = {
//       to: "user@example.com", // Replace with the signed-in user's email
//       subject: "Booking Confirmation",
//       body: `Your booking for ${property?.name} has been confirmed!\n\nDetails:\nPrice: $${property?.price}\nDescription: ${property?.description}`,
//     };
//
//     try {
//       await sendEmail(emailDetails); // Call the function to send the email
//       alert("Confirmation email sent!");
//     } catch (error) {
//       console.error("Error sending email:", error);
//       alert("Failed to send confirmation email.");
//     }
//
//     navigation.goBack(); // Navigate back after booking
//   };
//
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image
//         source={{ uri: property?.image }}
//         style={styles.image}
//         resizeMode="cover"
//       />
//       <View style={styles.detailsContainer}>
//         <Text style={styles.title}>{property?.name}</Text>
//         <Text style={styles.price}>${property?.price}</Text>
//         <Text style={styles.description}>{property?.description}</Text>
//
//         <TouchableOpacity onPress={handleConfirmBooking} style={styles.button}>
//           <Text style={styles.buttonText}>Confirm Booking</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 16,
//     backgroundColor: "#f8f9fa",
//   },
//   image: {
//     width: "100%",
//     height: 300,
//     borderRadius: 12,
//     marginBottom: 16,
//     borderWidth: 2,
//     borderColor: "#FF6347",
//   },
//   detailsContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: "#333",
//   },
//   price: {
//     fontSize: 22,
//     color: "#FF6347",
//     marginBottom: 12,
//   },
//   description: {
//     fontSize: 18,
//     color: "#666",
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: "#FF6347",
//     paddingVertical: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "bold",
//   },
// });
//
// export default BookingScreen;
