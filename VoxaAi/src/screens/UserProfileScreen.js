import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/theme";
import { authService } from "../services/api";

const { width, height } = Dimensions.get("window");

const UserProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.log("Error loading user data:", error);
    } finally {
      setLoading(false);
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

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarEmoji}>😊</Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userRole}>
              {user?.role || "Content Creator"}
            </Text>
          </View>

          {/* User Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>
                    {user?.name || "Not set"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>
                    {user?.email || "Not set"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>
                    {user?.phoneNumber || "Not set"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <Text style={styles.infoValue}>
                    {user?.role || "Not set"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="film-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Content Type</Text>
                  <Text style={styles.infoValue}>
                    {user?.contentType || "Not set"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment Plan Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Plan</Text>

            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planIconContainer}>
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.planContent}>
                  <Text style={styles.planName}>
                    {user?.subscriptionPlan || "Free Plan"}
                  </Text>
                  <Text style={styles.planStatus}>Active</Text>
                </View>
              </View>

              {!user?.subscriptionPlan && (
                <TouchableOpacity style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to Premium
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={async () => {
                await authService.logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
              <Text style={[styles.actionButtonText, { color: "#FF6B6B" }]}>
                Logout
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: {
    fontSize: 48,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#A0A0A0",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  planCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  planStatus: {
    fontSize: 12,
    color: "#00FF88",
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginLeft: 12,
  },
});

export default UserProfileScreen;
