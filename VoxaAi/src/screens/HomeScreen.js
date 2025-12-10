import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { colors } from "../styles/theme";

import { authService } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [recordings, setRecordings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadRecordings();
      loadUserData();
    }, [])
  );

  const loadRecordings = async () => {
    try {
      const data = await authService.getRecordings();
      setRecordings(data);
    } catch (error) {
      console.log("Error loading recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      console.log("User data loaded:", userData);
    } catch (error) {
      console.log("Error loading user data:", error);
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.avatar}
                onPress={() => navigation.navigate("UserProfile")}
              >
                {user?.profilePicture ? (
                  <Image
                    source={{ uri: user.profilePicture }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarEmoji}>😊</Text>
                )}
              </TouchableOpacity>
              <View style={styles.greetingContainer}>
                <Text style={styles.welcomeText}>Welcome Back!</Text>
                <Text style={styles.userName}>{user?.name || "User"}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* Wave Animation Section */}
          <View style={styles.waveContainer}>
            <LinearGradient
              colors={["#00FF88", "#00D4FF", "#6366F1", "#A855F7", "#EC4899"]}
              style={styles.waveGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              <View style={styles.waveInner}>
                {/* Wave bars simulation */}
                {[...Array(30)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      { height: Math.sin(i * 0.3) * 40 + 50 },
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Feature Cards Section */}
          <View style={styles.featureCardsContainer}>
            {/* Real Time Enhance Card */}
            <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="mic" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Real time Enhance</Text>
              <Text style={styles.featureDescription}>
                Record and enhance your voice in real-time
              </Text>
              <TouchableOpacity
                style={styles.featureButton}
                onPress={async () => {
                  try {
                    const { status } = await Audio.requestPermissionsAsync();
                    if (status === "granted") {
                      navigation.navigate("Recording");
                    } else {
                      Alert.alert(
                        "Permission Required",
                        "Please grant microphone permission to record audio."
                      );
                    }
                  } catch (error) {
                    console.error("Permission check failed", error);
                  }
                }}
              >
                <Text style={styles.featureButtonText}>Record</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Accent & Grammar Card */}
            <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
              <View style={styles.featureIconContainer}>
                <Ionicons
                  name="cloud-upload"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.featureTitle}>Accent & Grammar</Text>
              <Text style={styles.featureDescription}>
                Upload audio to fix accent and grammar
              </Text>
              <TouchableOpacity
                style={styles.featureButton}
                onPress={() => navigation.navigate("UploadAudio")}
              >
                <Text style={styles.featureButtonText}>Upload</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* History Section */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>History</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AllRecordings")}
              >
                <Text style={styles.seeAllText}>See all {">"}</Text>
              </TouchableOpacity>
            </View>

            {/* History Items */}
            {recordings.length === 0 ? (
              <Text
                style={{ color: "#A0A0A0", textAlign: "center", marginTop: 20 }}
              >
                No recordings yet
              </Text>
            ) : (
              recordings.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.historyItem}
                  onPress={() =>
                    navigation.navigate("AudioPlayer", {
                      audioFile: {
                        uri: item.originalAudioUrl,
                        title: item.title,
                        duration: item.duration,
                      },
                    })
                  }
                >
                  <View style={styles.historyItemLeft}>
                    <View style={styles.historyIconContainer}>
                      <Ionicons
                        name="musical-notes"
                        size={20}
                        color="#A0A0A0"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={styles.historyItemTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.historyItemDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={styles.historyDuration}>{item.duration}</Text>
                    <TouchableOpacity style={styles.playButton}>
                      <Ionicons name="play" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("AllRecordings")}
          >
            <Ionicons name="mic-outline" size={24} color="#A0A0A0" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("UserProfile")}
          >
            <Ionicons name="person-outline" size={24} color="#A0A0A0" />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  greetingContainer: {},
  welcomeText: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Wave Animation
  waveContainer: {
    height: 120,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  waveGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  waveInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  waveBar: {
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 2,
  },
  // Feature Cards
  featureCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(3, 124, 198, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: "#A0A0A0",
    marginBottom: 12,
    lineHeight: 16,
  },
  featureButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  featureButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // History Section
  historySection: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyItemTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    overflow: "hidden",
  },
  historyItemDate: {
    fontSize: 12,
    color: "#A0A0A0",
    marginTop: 2,
  },
  historyItemRight: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  historyDuration: {
    fontSize: 12,
    color: "#A0A0A0",
    marginRight: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  // Bottom Navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: "rgba(13, 13, 26, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  navItem: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
