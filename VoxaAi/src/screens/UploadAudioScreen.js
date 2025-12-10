import React, { useState } from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/theme";
import { authService } from "../services/api";

const { width, height } = Dimensions.get("window");

const UploadAudioScreen = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "audio/mpeg",
          "audio/wav",
          "audio/x-m4a",
          "audio/mp4",
          "audio/*",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Check file size (80MB limit)
        const maxSize = 80 * 1024 * 1024; // 80MB in bytes
        if (file.size && file.size > maxSize) {
          Alert.alert(
            "File Too Large",
            "Please select an audio file under 80MB."
          );
          return;
        }

        setSelectedFile(file);

        try {
          // Upload to backend
          const formData = new FormData();

          if (Platform.OS === "web") {
            // For Web: Append the file object directly or fetch blob
            if (file.file) {
              formData.append("audio", file.file);
            } else {
              // Fallback if file object is missing (should be there on web)
              const response = await fetch(file.uri);
              const blob = await response.blob();
              formData.append("audio", blob, file.name || "audio.mp3");
            }
          } else {
            // For Native: Append object with uri, name, type
            formData.append("audio", {
              uri: file.uri,
              name: file.name,
              type: file.mimeType || "audio/mpeg",
            });
          }

          formData.append("title", file.name);
          // Duration might not be available immediately, sending 0:00 or handling on backend would be better
          formData.append("duration", "0:00");

          await authService.saveRecording(formData);

          // Navigate to AudioPlayer screen with the selected file
          navigation.navigate("AudioPlayer", { audioFile: file });
        } catch (error) {
          console.error("Start upload error:", error);
          Alert.alert("Upload Failed", "Could not save file to history.");
          // Still navigate? Maybe not if upload failed. Let's let them decide.
          navigation.navigate("AudioPlayer", { audioFile: file });
        }
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick audio file. Please try again.");
    }
  };

  const handleClose = () => {
    navigation.goBack();
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

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Audio</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Upload Card */}
          <TouchableOpacity
            style={styles.uploadCard}
            onPress={handleUpload}
            activeOpacity={0.9}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color="#A0A0A0" />
            </TouchableOpacity>

            {/* Upload Icon */}
            <View style={styles.uploadIconContainer}>
              <View style={styles.uploadIconBg}>
                <Ionicons name="document" size={32} color={colors.primary} />
                <View style={styles.downloadArrow}>
                  <Ionicons name="arrow-down" size={14} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Upload Text */}
            <Text style={styles.uploadTitle}>Upload Audio</Text>

            {/* File Specs */}
            <View style={styles.specsContainer}>
              <View style={styles.specItem}>
                <View style={styles.specDot} />
                <Text style={styles.specText}>80MB</Text>
              </View>
              <View style={styles.specItem}>
                <View style={styles.specDot} />
                <Text style={styles.specText}>MP3, WAV, M4A</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  uploadCard: {
    backgroundColor: "rgba(30, 30, 50, 0.9)",
    borderRadius: 20,
    padding: 32,
    paddingTop: 40,
    alignItems: "center",
    width: width - 80,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadIconContainer: {
    marginBottom: 20,
  },
  uploadIconBg: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "rgba(3, 124, 198, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  downloadArrow: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  specsContainer: {
    alignItems: "center",
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  specDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  specText: {
    fontSize: 14,
    color: "#A0A0A0",
  },
});

export default UploadAudioScreen;
