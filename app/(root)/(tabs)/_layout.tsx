import {View, Text, Image} from 'react-native'
import React from 'react'
import {Tabs} from 'expo-router';
import icons from '@/constants/icons';
import {StyleSheet } from 'react-native';


const TabIcon = ({focused, icon, title}:{focused: boolean, icon: any, title: string}) =>(
    <View style={{
        flex: 1,
        marginTop:12,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems:'center',
        minWidth: 70,
    }}>
        <Image source={icon} tintColor={focused ? '#0061ff' : '#666876'} style={{width: 24, height: 24}} resizeMode="contain"/>
        <Text
            style={[
                styles.baseText,
                focused ? styles.focusedText : styles.unfocusedText,
                styles.textSize,
                styles.textCenter,
                styles.marginTop,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
        >
            {title}
        </Text>
    </View>
)
const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    position: 'absolute',
                    borderTopColor: '#0061FF1A',
                    borderTopWidth: 1,
                    minHeight: 70,
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            }}>
            <Tabs.Screen
                name ="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home"/>
                    )
                }}
            />
            <Tabs.Screen
                name ="explore"
                options={{
                    title: 'Explore',
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} icon={icons.search} title="Explore"/>
                    )
                }}
            />
            <Tabs.Screen
                name ="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} icon={icons.person} title="Profile"/>
                    )
                }}
            />
        </Tabs>
    )
}
export default TabsLayout
const styles = StyleSheet.create({
    baseText: {
    },
    focusedText: {
        color: '#0061FF',
        fontFamily: 'Rubik-Medium',
    },
    unfocusedText: {
        color: '#0061FF1A',
        fontFamily: 'Rubik-Regular',
    },
    textSize: {
        fontSize: 12,
    },
    textCenter: {
        textAlign: 'center',
    },
    marginTop: {
        marginTop: 4,
    },
});