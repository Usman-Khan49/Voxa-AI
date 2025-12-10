import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import RoleSelectionScreen from "../screens/RoleSelectionScreen";
import ContentTypeScreen from "../screens/ContentTypeScreen";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import HomeScreen from "../screens/HomeScreen";
import UploadAudioScreen from "../screens/UploadAudioScreen";
import AudioPlayerScreen from "../screens/AudioPlayerScreen";
import RecordingScreen from "../screens/RecordingScreen";
import AllRecordingsScreen from "../screens/AllRecordingsScreen";
import UserProfileScreen from "../screens/UserProfileScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "#0D0D1A" },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="ContentType"
        component={ContentTypeScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="CompleteProfile"
        component={CompleteProfileScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ animation: "fade" }}
      />
      <Stack.Screen
        name="UploadAudio"
        component={UploadAudioScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="AudioPlayer"
        component={AudioPlayerScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Recording"
        component={RecordingScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="AllRecordings"
        component={AllRecordingsScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
