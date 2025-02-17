import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import Search from "@/components/Search";
import { Card } from "@/components/Cards";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";

import { getProperties } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { useGlobalContext } from "@/lib/global-provider";

const Explore = () => {
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const { user } = useGlobalContext();

  // Ensure default values for filter and query
  const filter = params.filter || "";
  const query = params.query || "";

  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getProperties,
    params: {
      filter,
      query,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter,
      query,
    });
  }, [params.filter, params.query]);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const handleEditPress = (id: string) => {
    router.push({ pathname: "/AddProperty", params: { id } });
  };

  // Ensure properties is always an array
  const propertyList = properties || [];

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={propertyList}
        numColumns={2}
        renderItem={({ item }) => (
          <View>
            <Card item={item} onPress={() => handleCardPress(item.$id)} />
            {user?.role === "agent" && (
              <TouchableOpacity
                onPress={() => handleEditPress(item.$id)}
                className="bg-primary-300 p-2 rounded mt-2"
              >
                <Text className="text-white text-center">Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item) => item.$id}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
        ListHeaderComponent={() => (
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="size-5" />
              </TouchableOpacity>

              <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
                Search for Your Ideal Home
              </Text>
              <Image source={icons.bell} className="w-6 h-6" />
            </View>

            <Search />

            <View className="mt-5">
              <Filters />

              <Text className="text-xl font-rubik-bold text-black-300 mt-5">
                Found {propertyList.length} Properties
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Explore;
