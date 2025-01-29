import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ImageSourcePropType, Alert
} from 'react-native';
import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { settings } from "@/constants/data";
import { useGlobalContext } from "@/lib/global-provider";
import {avatar, logout} from "@/lib/appwrite";


// Settings Item Component
interface SettingsItemProps {
    icon: ImageSourcePropType;
    title: string;
    onPress?: () => void;
    textStyles?: string;
    showArrow?: boolean;
}

const SettingsItem = ({ icon, title, onPress, textStyles, showArrow = true }: SettingsItemProps) => (
    <TouchableOpacity onPress={onPress} style={styles.settingsItemContainer}>
        <View style={styles.settingsItem}>
            <Image style={styles.settingsIcon} source={icon} />
            <Text style={[styles.textLg, styles.fontRubikMedium, styles.textBlack, textStyles ? { fontFamily: textStyles } : null]}>
                {title}
            </Text>
        </View>
        {showArrow && <Image source={icons.rightArrow} style={styles.arrowIcon} />}
    </TouchableOpacity>
);

const Profile = () => {
    const {user, refetch} = useGlobalContext();
    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result) {
                Alert.alert("Success", "You have been logged out successfully");
                refetch();
            } else {
                Alert.alert("Error", "An error occurred while logging out");
            }
        } catch (error) {
            console.error("Logout error:", error); // Log the error for debugging
            Alert.alert("Error", "An error occurred while logging out");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <Image source={icons.bell} style={styles.bellIcon} />
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.avatarContainer}>
                        <Image source={{uri: user?.avatar}} style={styles.avatar} />

                        <TouchableOpacity style={styles.editIconContainer}>
                            <Image source={icons.edit} style={styles.editIcon} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.username}>{user?.name}</Text>
                </View>

                {/* Settings Items */}
                <View style={styles.sectionContainer}>
                    <SettingsItem icon={icons.calendar} title="My Bookings" />
                    <SettingsItem icon={icons.wallet} title="Payments" />
                </View>

                {/* Additional Settings */}
                <View style={styles.divider}>
                    {settings.slice(2).map((item, index) => (
                        <SettingsItem key={index} {...item} />
                    ))}
                </View>
                <View style={{
                    display:"flex",
                    flexDirection:"column",
                    marginTop:20,
                    paddingTop:20,
                    borderTopWidth:1,
                    borderTopColor:"#0061FF1A"
                }}>
                <SettingsItem icon={icons.logout} title ="Logout"
                      textStyles="textDanger" showArrow={false} onPress={handleLogout} />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// Styles
const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#ffffff',
        height: '100%',
    },
    contentContainer: {
        paddingBottom: 128,
        paddingHorizontal: 28,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    title: {
        fontSize: 32,
        fontFamily: "Rubik-Bold",
    },
    bellIcon: {
        width: 20,
        height: 20,
    },

    /* Profile Section */
    profileContainer: {
        flexDirection: 'row', // Row alignment
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,  // Adjust size as needed
        height: 100,
        borderRadius: 50,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    editIcon: {
        width: 24,
        height: 24,
    },
    username: {
        fontSize: 24,
        marginLeft: 15,  // Space between avatar and name
        fontFamily: "Rubik-Bold",
        color: '#000000',
    },

    /* Settings Items */
    sectionContainer: {
        marginTop: 40,
    },
    settingsItemContainer: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    settingsItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    settingsIcon: {
        width: 24,
        height: 24,
    },
    arrowIcon: {
        width: 20,
        height: 20,
    },

    /* Divider for additional settings */
    divider: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#0061FF1A",
    },

    /* Text Styles */
    textLg: {
        fontSize: 18,
    },
    fontRubikMedium: {
        fontFamily: 'Rubik-Medium',
    },
    textBlack: {
        color: '#000000',
    },
    textDanger: {
        color: '#FF0000',
    },
});

export default Profile;
