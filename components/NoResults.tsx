import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import images from "@/constants/images";

const NoResults = () => {
    return (
        <View style={styles.container}>
            <Image source={images.noResult} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>No Result</Text>
            <Text style={styles.subtitle}>We could not find any result</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginVertical: 20,
    },
    image: {
        width: "90%",
        height: 200,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: "#888",
        marginTop: 10,
    },
});

export default NoResults;
