import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Platform, // Import Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { getApiBaseUrl } from "../config/apiConfig";
import { colors } from "../styles/theme";

const { width, height } = Dimensions.get("window");

const AudioPlayerScreen = ({ navigation, route }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioFile = route?.params?.audioFile;

  useEffect(() => {
    loadAudio();
  }, [audioFile]);

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadAudio = async () => {
    try {
      if (audioFile?.uri) {
        let uri = audioFile.uri;

        // Fix URLs for physical devices - replace localhost or emulator IPs with actual API base URL
        if (Platform.OS !== "web") {
          const apiBaseUrl = getApiBaseUrl();

          // Replace host and port completely
          if (
            uri.includes("localhost") ||
            uri.includes("10.0.2.2") ||
            uri.includes("10.218.198.149")
          ) {
            // Extract the path part (everything after the port)
            const pathMatch = uri.match(/https?:\/\/[^\/]+(\/.+)/);
            if (pathMatch) {
              uri = `${apiBaseUrl}${pathMatch[1]}`;
            }
          }
        }

        console.log("Loading audio from:", uri);

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }, // Auto play
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      }
    } catch (error) {
      console.error("Error loading audio:", error);
      Alert.alert("Playback Error", "Could not play audio file.");
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  const handleShare = () => {
    Alert.alert("Share", "Share functionality coming soon!");
  };

  const handleDownload = () => {
    Alert.alert("Downloaded", "Audio saved to your device!");
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {audioFile?.title || "Audio Player"}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Audio Preview Card */}
          <View style={styles.audioCard}>
            {/* Waveform Visualization */}
            <Image
              source={require("../../assets/recordingBackground.png")}
              style={styles.waveformImage}
              resizeMode="cover"
            />

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progress * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* Time Display */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Play Button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <View style={styles.playButtonInner}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={32}
                color={colors.primary}
                style={!isPlaying && styles.playIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download</Text>
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
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  audioCard: {
    width: "100%",
    backgroundColor: "rgba(30, 30, 50, 0.8)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 40,
  },
  waveformContainer: {
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  waveformImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  waveformGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  waveformInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  waveBar: {
    width: 3,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 2,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(3, 124, 198, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(200, 230, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    marginLeft: 4, // Offset for visual balance
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  downloadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AudioPlayerScreen;
