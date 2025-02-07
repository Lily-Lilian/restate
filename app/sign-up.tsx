import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";

const PropertyForm = () => {
  const [selectedProperty, setSelectedProperty] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const propertyTypes = [
    "Apartment",
    "House",
    "Villa",
    "Townhouse",
    "Commercial",
    "Land",
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      setPreviewImage(result.assets[0].uri as unknown as null);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
  };

  const handleSubmit = () => {
    console.log("Selected property:", selectedProperty);
    console.log("Image:", previewImage);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Property</Text>

      <View style={styles.formContainer}>
        {/* Property Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Property Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProperty}
              onValueChange={(itemValue) => setSelectedProperty(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a property type" value="" />
              {propertyTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Image Upload Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Property Image</Text>

          {!previewImage ? (
            <TouchableOpacity
              style={styles.uploadContainer}
              onPress={pickImage}
            >
              <MaterialIcons name="cloud-upload" size={48} color="#666" />
              <Text style={styles.uploadText}>Tap to upload an image</Text>
              <Text style={styles.uploadSubText}>PNG, JPG, GIF supported</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: previewImage }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={removeImage}
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Property</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  uploadText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  uploadSubText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  previewContainer: {
    position: "relative",
    marginTop: 10,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    borderRadius: 20,
    padding: 5,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PropertyForm;
