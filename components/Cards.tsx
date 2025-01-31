import {View, Text, TouchableOpacity, Image} from 'react-native'
import React from 'react'
import images from "@/constants/images";
import icons from "@/constants/icons";
import {Models} from "react-native-appwrite";
import {yellow} from "colorette";

interface Props {
    item: Models.Document;
    onPress?: () => void;
}
export const FeaturedCard = ({item:{image,rating,name,address,price},onPress}: Props) => {
    return (
       <TouchableOpacity onPress={onPress} style={{
           display:"flex",
           flexDirection:"column",
           alignItems:"flex-start",
           position: "relative",
           width:200,
           height:300,
           marginRight:8,
       }}>
        <Image source={{uri:image}} style={{
            width:"100%",
            height:"100%",
            borderRadius:20,
        }}/>
           <Image source={images.cardGradient} style={{
               width:"100%",
               height:"100%",
               borderRadius:24,
               position:"absolute",
               bottom:0,
           }}/>
           <View style={{
               display:"flex",
               flexDirection:"row",
               alignItems:"center",
               backgroundColor: "rgba(255, 255, 255, 0.9)",
               position:"absolute",
               top:20,
               right:20,
               borderRadius:50,
               paddingHorizontal:12,
               paddingVertical:6,

           }}>
           <Image source={icons.star} style={{
               width:20,
               height:20,
           }}/>
               <Text style={{
                   fontSize:12,
                   fontFamily:"Rubik-bold",
                   color:"#4B4B4B",
                   marginLeft:4,
               }}>{rating}</Text>
           </View>
           <View style={{
               display:"flex",
               flexDirection:"column",
               alignItems:"flex-start",
               position:"absolute",
               bottom:10,
               left:10,
               right:10
           }}>

               <Text style={{
                   fontSize:20,
                   fontFamily:"Rubik-extraBold",
                   color:"#fff"
               }} numberOfLines={1}>{name}</Text>
               <Text style={{
                   fontSize:16,
                   fontFamily:"Rubik-regular",
                   color:"#fff",
               }}>{address}</Text>
               <View style={{
                   display:"flex",
                   flexDirection:"row",
                   alignItems:"center",
                   justifyContent:"space-between",
                   width:"100%",
               }}>
                   <Text style={{
                       fontSize:16,
                       fontFamily:"Rubik-extraBold",
                       color:"#fff",
                   }}>{price}</Text>
                   <Image source={icons.heart} style={{ width:20, height:20}}/>
               </View>
           </View>
       </TouchableOpacity>
    )
}
export const Card =  ({item:{image,rating,name,address,price},onPress}: Props) => {
    return (
        <TouchableOpacity onPress={onPress} style={{
            width: '100%',
            marginTop: 16,
            paddingHorizontal: 12,
            paddingVertical: 16,
            borderRadius: 8,
            backgroundColor: 'white',
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.7,
            shadowRadius: 8,
            elevation: 8,
            position: 'relative',

        }}>
            <View style={{
                display:"flex",
                flexDirection:"row",
                alignItems:"center",
                position:"absolute",
                top:20,
                right:20,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding:4,
                zIndex:50,
                borderRadius:50,
                paddingHorizontal:20,

            }}>
                <Image source={icons.star} style={{
                    width:20,
                    height:20,
                }}/>
                <Text style={{
                    fontSize:12,
                    fontFamily:"Rubik-bold",
                    color:"#4B4B4B",
                    marginLeft:4,
                }}>{rating}</Text>
            </View>
            <Image source={{uri:image}} style={{
                width:"100%",
                borderRadius:8,
                height:120,
            }}/>
            <View style={{
                display:"flex",
                flexDirection:"column",
                marginTop:8,
            }}>

                <Text style={{
                    fontSize:16,
                    fontFamily:"Rubik-Bold",
                    color:"rgba(0, 0, 0, 0.3)"
                }} numberOfLines={1}>{name}</Text>
                <Text style={{
                    fontSize:12,
                    fontFamily:"Rubik-extraBold",
                    color:"rgba(0, 0, 0, 0.2)",
                }}>{address}</Text>
                <View style={{
                    display:"flex",
                    flexDirection:"row",
                    alignItems:"center",
                    justifyContent:"space-between",
                    marginTop:8,
                }}>
                    <Text style={{
                        fontSize:16,
                        fontFamily:"Rubik-Bold",
                        color:"#0061FF",
                    }}>{price}</Text>
                    <Image source={icons.heart} style={{ width:20, height:20, marginRight:8,tintColor:"#191d31"}}/>
                </View>
            </View>
            </TouchableOpacity>
    )
}