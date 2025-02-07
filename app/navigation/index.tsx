import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "../(root)/(tabs)/profile";
import AddProperty from "../AddProperty";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="add-property" component={AddProperty} />{" "}
    </Stack.Navigator>
  );
};

export default AppNavigator;
