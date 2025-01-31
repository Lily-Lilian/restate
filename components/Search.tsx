import {View, Text, Image, TextInput, TouchableOpacity} from 'react-native'
import React, {useState} from 'react'
import {useLocalSearchParams, usePathname, router} from "expo-router";
import icons from "@/constants/icons";
import {useDebouncedCallback} from "use-debounce";

const Search = () => {
    const path = usePathname();
    const params = useLocalSearchParams<{query?: string}>();
    const [search, setSearch] = useState(params.query);

    const debouncedSearch = useDebouncedCallback((text: string) => {
        router.setParams({ query: text });
    }, 500);

    const handleSearch = (text: string) => {
        setSearch(text);
        debouncedSearch(text);
    }
    return (
        <View style={{
            display:"flex",
            flexDirection:"row",
            alignItems:'center',
            justifyContent:"space-between",
            width:"100%",
            paddingLeft:16,
            paddingRight:16,
            borderRadius:20,
            backgroundColor:"#FBFBFD",
            borderWidth: 1,
            borderColor:"#0061FF0A",
            marginTop:20,
            paddingTop:10,
            paddingBottom:10,
        }}>
            <View style={{
                flex:1,
                flexDirection:"row",
                alignItems:"center",
                justifyContent:"flex-start",
                zIndex:50,
            }}>
                <Image source={icons.search} style={{width:20, height:20}} />
                <TextInput value={search} onChangeText={handleSearch}  placeholder="Search for anything" style={{
                    flex:1,
                    marginLeft:8,
                    fontSize:14,
                    fontFamily:"Rubik-regular",
                    color:"#4B4B4B",
                }} />
            </View>
            <TouchableOpacity>
                <Image source={icons.filter} style={{width:20, height:20}} />
            </TouchableOpacity>
        </View>
    )
}
export default Search
