import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../styles/theme";
import AuthInput from "../components/AuthInput";
import { authService } from "../services/api";
import axios from "axios";
import { getApiBaseUrl } from "../config/apiConfig";

const { width, height } = Dimensions.get("window");

const CompleteProfileScreen = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const role = route?.params?.role;
  const contentType = route?.params?.contentType;

  const isFormValid = name.trim() && phone.trim();

  const handleComplete = async () => {
    if (isFormValid) {
      setLoading(true);
      try {
        // First, test basic connectivity
        console.log("[Profile] Testing server connectivity...");
        try {
          const healthCheck = await axios.get(`${getApiBaseUrl()}/health`, {
            timeout: 5000,
          });
          console.log("[Profile] Server is reachable:", healthCheck.data);
        } catch (connError) {
          console.error(
            "[Profile] Server connectivity test failed:",
            connError.message
          );
          Alert.alert(
            "Connection Error",
            `Cannot reach server\n\nMake sure:\n• Backend server is running\n• Internet connection is stable`,
            [{ text: "OK" }]
          );
          setLoading(false);
          return;
        }

        console.log("[Profile] Sending profile update...");

        // If there's no profile image, send as JSON (more reliable)
        if (!profileImage) {
          const profileData = {
            name: name,
            phoneNumber: phone,
            role: role,
            contentType: contentType,
          };
          console.log("[Profile] Sending as JSON (no image)");
          await authService.updateProfile(profileData);
        } else {
          // With image, use FormData
          const formData = new FormData();
          formData.append("name", name);
          formData.append("phoneNumber", phone);
          formData.append("role", role);
          formData.append("contentType", contentType);

          const filename = profileImage.split("/").pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;

          formData.append("profilePicture", {
            uri: profileImage,
            name: filename,
            type,
          });

          console.log("[Profile] Sending with FormData (has image)");
          await authService.updateProfile(formData);
        }

        // Navigate to Home screen
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } catch (error) {
        console.error("Profile completion error:", error);
        Alert.alert(
          "Error",
          error.error || error.message || "Failed to update profile"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditPhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert("You've refused to allow this appp to access your photos!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={[
          colors.gradientStart,
          colors.gradientMiddle,
          colors.gradientEnd,
        ]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Noise overlay */}
        <Image
          source={require("../../assets/noise.png")}
          style={styles.noiseOverlay}
          resizeMode="repeat"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation Row */}
            <View style={styles.topRow}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Progress Indicator - Step 3 of 3 (all active) */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, styles.progressBarActive]} />
                <View style={[styles.progressBar, styles.progressBarActive]} />
                <View style={[styles.progressBar, styles.progressBarActive]} />
              </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Add your details to personalize your experience
              </Text>
            </View>

            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
              <View style={styles.profilePicture}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Text style={styles.profileEmoji}>😊</Text>
                )}
              </View>
              {/* Camera Edit Button */}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleEditPhoto}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <AuthInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                iconName="person-outline"
                autoCapitalize="words"
              />

              <AuthInput
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                iconName="call-outline"
                keyboardType="phone-pad"
              />
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                !isFormValid && styles.completeButtonDisabled,
              ]}
              onPress={handleComplete}
              activeOpacity={0.8}
              disabled={!isFormValid}
            >
              <Text
                style={[
                  styles.completeButtonText,
                  !isFormValid && styles.completeButtonTextDisabled,
                ]}
              >
                {loading ? "Completing Profile..." : "Complete"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  noiseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    opacity: 0.03,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  progressBarActive: {
    backgroundColor: colors.primary,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileEmoji: {
    fontSize: 60,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: width / 2 - 60 - 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.gradientStart,
  },
  formSection: {
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: "auto",
  },
  completeButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  completeButtonTextDisabled: {
    color: "#A0A0A0",
  },
});

export default CompleteProfileScreen;
