import {Text, View, StyleSheet} from "react-native";
import {Link} from "expo-router";

export default function Index(){
    return(
        <View
        style = {{
            flex: 1,
            justifyContent:"center",
            alignItems:"center",
        }}>
            <Text style={styles.title}>Welcome to Estate Connect </Text>
            <Link href="/sign-in">Sign In</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/properties/1">Property</Link>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 10,
        fontSize: 20,
        fontFamily: "Rubik-Bold"
    }
})