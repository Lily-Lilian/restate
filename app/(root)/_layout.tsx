import {useGlobalContext} from "@/lib/global-provider";
import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator} from "react-native";
import {Redirect,Slot} from "expo-router";

export default function AppLayout(){
    const {loading, isLogged} = useGlobalContext();

    if(loading){
        return(
            <SafeAreaView style={{backgroundColor: "#fff", height:"100%", display:"flex",
                justifyContent:"center", alignItems:"center"}}>
                <ActivityIndicator color="#666876" size="large" />
            </SafeAreaView>
        )
    }
    if(!isLogged) return <Redirect href='/sign-in' />
    return <Slot />
}