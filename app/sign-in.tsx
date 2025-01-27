import {View, Text, StyleSheet, ScrollView, Image, TouchableOpacity} from 'react-native'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import images from '@/constants/images';
import icons from '@/constants/icons';

const SignIn = () => {
    const handleLogin = () => {};
    return (
        <SafeAreaView style={{ backgroundColor: "#fff", height: "100%" }}>
        <ScrollView contentContainerStyle={{
            height: "100%",
        }}>
            <Image source={images.onboarding}
                   style={{ width: "100%", height: "66.67%" }}
                   resizeMode="contain"
            />
            <View style={{ paddingHorizontal: 10, alignItems: "center"}}>
                <Text style={{textAlign:"center", textTransform:"uppercase", fontSize:14, fontFamily:"Rubik" }}>Welcome to Estate Connect</Text>
                    <Text style={{textAlign:"center",fontSize:22, fontFamily:"Rubik-bold", marginTop:8, color:"#191D31"}}>
                        Let's Get you Closer to {"\n"}
                        <Text style={{color:"#0061FF"}}>Your Ideal Home</Text>
                    </Text>
                <Text style={{color:"#8C8E98", fontSize:14, textAlign:"center", fontFamily:"Rubik", marginTop:24}}>
                    Login with Google
                </Text>
                <TouchableOpacity onPress={handleLogin} style={{
                    backgroundColor: "#ffffff",
                    shadowColor: "#d4d4d8",
                    shadowOpacity: 0.5,
                    shadowRadius: 4,

                    shadowOffset: { width: 0, height: 2 },
                    borderRadius: 9999,
                    width: "80%",
                    paddingVertical: 16,
                    marginTop: 20,
                    alignItems: "center",
                }}>
                    <View  style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    <Image source={icons.google}  style={{
                        width: 20,
                        height: 20,
                    }} resizeMode="contain"/>
                        <Text style={{
                            fontSize: 18,
                            fontFamily: "Rubik-Medium",
                            color: "#4b5563",
                            marginLeft: 8,
                        }}> Continue with Google</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn
