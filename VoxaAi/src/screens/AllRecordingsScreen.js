import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/theme";
import { authService } from "../services/api";

const { width, height } = Dimensions.get("window");

const AllRecordingsScreen = ({ navigation }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("original"); // 'original' or 'enhanced'

  useEffect(() => {
    loadRecordings();
  }, []);

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

  const renderItem = ({ item }) => {
    const audioUrl =
      activeTab === "enhanced" && item.enhancedAudioUrl
        ? item.enhancedAudioUrl
        : item.originalAudioUrl;

    const hasEnhanced = !!item.enhancedAudioUrl;

    return (
      <TouchableOpacity
        style={styles.recordingItem}
        onPress={() =>
          navigation.navigate("AudioPlayer", {
            audioFile: {
              uri: audioUrl,
              title: item.title,
              duration: item.duration,
            },
          })
        }
      >
        <View style={styles.recordingItemLeft}>
          <View style={styles.recordingIconContainer}>
            <Ionicons
              name={
                activeTab === "enhanced" && hasEnhanced
                  ? "sparkles"
                  : "musical-notes"
              }
              size={24}
              color={
                activeTab === "enhanced" && hasEnhanced
                  ? colors.primary
                  : "#A0A0A0"
              }
            />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={styles.recordingTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title || "Untitled Recording"}
            </Text>
            <Text style={styles.recordingDate}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "Unknown Date"}
            </Text>
            {activeTab === "enhanced" && !hasEnhanced && (
              <Text style={styles.processingText}>Processing...</Text>
            )}
          </View>
        </View>
        <View style={styles.recordingItemRight}>
          <Text style={styles.recordingDuration}>
            {item.duration || "0:00"}
          </Text>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
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
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Audios</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "original" && styles.activeTab]}
            onPress={() => setActiveTab("original")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "original" && styles.activeTabText,
              ]}
            >
              Original
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "enhanced" && styles.activeTab]}
            onPress={() => setActiveTab("enhanced")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "enhanced" && styles.activeTabText,
              ]}
            >
              Enhanced
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : recordings.length === 0 ? (
            <Text style={styles.noRecordingsText}>No recordings found</Text>
          ) : (
            <FlatList
              data={recordings}
              renderItem={renderItem}
              keyExtractor={(item) => item._id || Math.random().toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons name="home-outline" size={24} color="#A0A0A0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            {/* Filled icon and primary color to show active state */}
            <Ionicons name="mic" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
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
  },
  listContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  loadingText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 50,
  },
  noRecordingsText: {
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 50,
  },
  recordingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  recordingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recordingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  processingText: {
    fontSize: 11,
    color: "#FFA500",
    marginTop: 2,
  },
  recordingItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingDuration: {
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A0A0A0",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
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
    borderTopWidth: 1, // Optional: thinner border for cleaner look
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  navItem: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AllRecordingsScreen;
