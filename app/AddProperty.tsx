import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  databases,
  storage,
  ID,
  account,
} from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

const AddProperty = () => {
  const router = useRouter();
  const { user } = useGlobalContext();

  const [propertyType, setPropertyType] = useState("");
  const [propertyDetails, setPropertyDetails] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [imageId, setImageId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [price, setPrice] = useState("");

  const propertyTypes = [
    "House",
    "Townhouse",
    "Condo",
    "Duplex",
    "Studio",
    "Villa",
    "Apartments",
    "Other",
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setPreviewImage(result.assets[0].uri as any);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileId = ID.unique();
      const fileName = `property-${fileId}.jpg`;

      const file = {
        name: fileName,
        type: "image/jpeg",
        size: blob.size,
        uri: uri,
      };

      await storage.createFile(
        process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!,
        fileId,
        file
      );

      const imageUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/v1/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view`;

      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    if (!isVerified) {
      Alert.alert(
        "Error",
        "Please verify your email address before adding a property."
      );
      return;
    }

    if (!propertyType || !propertyDetails || !price) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    if (!user?.$id) {
      Alert.alert("Error", "You must be logged in to add a property");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImageId = null;
      if (previewImage) {
        uploadedImageId = await uploadImage(previewImage);
        setImageId(uploadedImageId);
      }

      const propertyData = {
        name: propertyType,
        type: propertyType,
        description: propertyDetails,
        address: address,
        price: parseFloat(price) || 0,
        area: 0.0,
        bedrooms: 0,
        bathrooms: 0,
        rating: 0.0,
        facilities: [],
        image: uploadedImageId,
        geolocation: "",
        agent: user.$id,
        gallery: [],
        reviews: [],
      };

      await databases.createDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID!,
        ID.unique(),
        propertyData
      );

      Alert.alert("Success", "Property added successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/"),
        },
      ]);
    } catch (error) {
      console.error("Error submitting property:", error);
      Alert.alert("Error", "Failed to add property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView className="flex-1 px-6">
        <Text className="text-2xl font-rubik-bold text-[#1B1B1B] mt-6 mb-8">
          Add New Property
        </Text>

        <View className="space-y-6">
          {/* Property Type Selection */}
          <View>
            <Text className="text-base text-[#6B7280] mb-2">Property Type</Text>
            <TouchableOpacity
              onPress={() => setShowTypeModal(true)}
              className="border border-[#E5E7EB] rounded-lg p-4 flex-row justify-between items-center"
            >
              <Text
                className={propertyType ? "text-[#1B1B1B]" : "text-[#6B7280]"}
              >
                {propertyType || "Select property type"}
              </Text>
              <Image
                source={require("@/assets/icons/down-arrow.png")}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Price Input */}
          <View>
            <Text className="text-base text-[#6B7280] mb-2">Price</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              className="border border-[#E5E7EB] bg-[#F9FAFB] rounded-lg p-4 text-[#1B1B1B]"
              placeholder="Enter property price"
            />
          </View>

          {/* Property Type Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showTypeModal}
            onRequestClose={() => setShowTypeModal(false)}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl p-6">
                <Text className="text-xl font-rubik-medium text-[#1B1B1B] mb-4">
                  Select Property Type
                </Text>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setPropertyType(type);
                      setShowTypeModal(false);
                    }}
                    className="py-4 border-b border-[#E5E7EB]"
                  >
                    <Text className="text-lg text-[#1B1B1B]">{type}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => setShowTypeModal(false)}
                  className="mt-4 py-4 bg-[#0066FF] rounded-full"
                >
                  <Text className="text-white text-center font-medium">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Property Details */}
          <View>
            <Text className="text-base text-[#6B7280] mb-2">
              Property Details
            </Text>
            <TextInput
              value={propertyDetails}
              onChangeText={setPropertyDetails}
              multiline
              numberOfLines={4}
              className="border border-[#E5E7EB] bg-[#F9FAFB] rounded-lg p-4 text-[#1B1B1B]"
              placeholder="Enter property details"
              textAlignVertical="top"
            />
          </View>

          {/* Address Input */}
          <View>
            <Text className="text-base text-[#6B7280] mb-2">Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              className="border border-[#E5E7EB] bg-[#F9FAFB] rounded-lg p-4 text-[#1B1B1B]"
              placeholder="Enter property address"
            />
          </View>

          {/* Property Image */}
          <View>
            <Text className="text-base text-[#6B7280] mb-2">
              Property Image
            </Text>

            {!previewImage ? (
              <TouchableOpacity
                onPress={pickImage}
                className="border border-dashed border-[#E5E7EB] rounded-lg p-8 items-center"
              >
                <Image
                  source={require("@/assets/icons/upload.png")}
                  className="w-8 h-8 mb-4"
                  resizeMode="contain"
                />
                <Text className="text-base text-[#4B5563]">
                  Tap to upload an image
                </Text>
                <Text className="text-sm text-[#6B7280] mt-1">
                  PNG, JPG, GIF supported
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="relative">
                <Image
                  source={{ uri: previewImage }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setPreviewImage(null)}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                >
                  <Text className="text-white">✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Add Property Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`bg-[#0066FF] rounded-full py-4 mt-8 ${
              isSubmitting ? "opacity-70" : ""
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-medium text-white text-center">
                Add Property
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProperty;
