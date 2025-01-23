import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { View, Text } from 'react-native'

const property = () =>{
    const {id} = useLocalSearchParams();
  return (
    <View>
      <Text>property {id}</Text>
    </View>
  )
}

export default property
