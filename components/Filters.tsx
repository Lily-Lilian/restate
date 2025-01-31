import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Text, ScrollView, TouchableOpacity } from "react-native";
import { categories } from "@/constants/data";

const Filters = () => {
    const params = useLocalSearchParams<{ filter?: string }>();
    const [selectedCategory, setSelectedCategory] = useState(params.filter || "All");

    const handleCategoryPress = (category: string) => {
        if (selectedCategory === category) {
            setSelectedCategory("");
            router.push({ pathname: "/", params: { filter: "" } });
            return;
        }

        setSelectedCategory(category);
        router.push({ pathname: "/", params: { filter: category } });
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginBottom: 8 }}>
            {categories.map((item, index) => (
                <TouchableOpacity
                    onPress={() => handleCategoryPress(item.title)}
                    key={index}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 16,
                        backgroundColor: selectedCategory === item.title ? "#3498db" : "#f0f0f0",
                        borderWidth: selectedCategory === item.title ? 0 : 1,
                        borderColor: "#ccc",
                    }}
                >
                    <Text style={{ color: selectedCategory === item.title ? "#fff" : "#000", fontSize: 14 }}>
                        {item.title}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default Filters;
