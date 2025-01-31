import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from "react-native";
import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";

import Search from "@/components/Search";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import { Card, FeaturedCard } from "@/components/Cards";

import { useAppwrite } from "@/lib/useAppwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { getLatestProperties, getProperties } from "@/lib/appwrite";

const Home = () => {
    const { user } = useGlobalContext();
    const params = useLocalSearchParams<{ query?: string; filter?: string }>();

    const { data: latestProperties, loading: latestPropertiesLoading } =
        useAppwrite({
            fn: getLatestProperties,
        });

    const {
        data: properties,
        refetch,
        loading,
    } = useAppwrite({
        fn: getProperties,
        params: {
            filter: params.filter!,
            query: params.query!,
            limit: 6,
        },
        skip: true,
    });

    useEffect(() => {
        refetch({
            filter: params.filter!,
            query: params.query!,
            limit: 6,
        });
    }, [params.filter, params.query]);

    const handleCardPress = (id: string) => router.push(`/properties/${id}`);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={properties}
                numColumns={2}
                renderItem={({ item }) => (
                    <Card item={item} onPress={() => handleCardPress(item.$id)} />
                )}
                keyExtractor={(item) => item.$id}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
                    ) : (
                        <NoResults />
                    )
                }
                ListHeaderComponent={() => (
                    <View style={styles.headerContainer}>
                        <View style={styles.header}>
                            <View style={styles.profileContainer}>
                                <Image
                                    source={{ uri: user?.avatar }}
                                    style={styles.avatar}
                                />
                                <View style={styles.userInfo}>
                                    <Text style={styles.greeting}>Good Morning</Text>
                                    <Text style={styles.userName}>{user?.name}</Text>
                                </View>
                            </View>
                            <Image source={icons.bell} style={styles.bellIcon} />
                        </View>

                        <Search />

                        <View style={styles.featuredContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Featured</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAll}>See all</Text>
                                </TouchableOpacity>
                            </View>

                            {latestPropertiesLoading ? (
                                <ActivityIndicator size="large" color="#007AFF" />
                            ) : !latestProperties || latestProperties.length === 0 ? (
                                <NoResults />
                            ) : (
                                <FlatList
                                    data={latestProperties}
                                    renderItem={({ item }) => (
                                        <FeaturedCard
                                            item={item}
                                            onPress={() => handleCardPress(item.$id)}
                                        />
                                    )}
                                    keyExtractor={(item) => item.$id}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.featuredList}
                                />
                            )}
                        </View>

                        <View style={styles.recommendationContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Our Recommendation</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAll}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            <Filters />
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    listContent: {
        paddingBottom: 120,
    },
    columnWrapper: {
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    loader: {
        marginTop: 20,
    },
    headerContainer: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    userInfo: {
        marginLeft: 10,
    },
    greeting: {
        fontSize: 12,
        color: "#888",
    },
    userName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    bellIcon: {
        width: 24,
        height: 24,
    },
    featuredContainer: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    seeAll: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007AFF",
    },
    featuredList: {
        marginTop: 10,
    },
    recommendationContainer: {
        marginTop: 20,
    },
});

export default Home;
