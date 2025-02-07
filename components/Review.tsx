import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useAppwrite } from "@/lib/useAppwrite";

const Review = ({ propertyId }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const submitReview = async () => {
    // Submit review to the backend
  };

  return (
    <View>
      <TextInput
        value={reviewText}
        onChangeText={setReviewText}
        placeholder="Write a review"
      />
      <Button title="Submit Review" onPress={submitReview} />
    </View>
  );
};

export default Review;
