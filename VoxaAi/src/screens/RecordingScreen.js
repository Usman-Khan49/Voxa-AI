import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { colors } from "../styles/theme";
import { authService } from "../services/api";
import ProcessingModal from "../components/ProcessingModal";

const { width, height } = Dimensions.get("window");

const RecordingScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // Progress modal state
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStage, setProcessingStage] = useState("Uploading...");
  const [processingProgress, setProcessingProgress] = useState(0);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recording) {
        stopUnknownRecording();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const stopUnknownRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
    } catch (error) {
      // Do nothing
    }
  };

  const startRecording = async () => {
    try {
      if (permissionResponse.status !== "granted") {
        const { status } = await requestPermission();
        if (status !== "granted") return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);

      // Start timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      clearInterval(timerRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);
      // Here you could save the URI or pass it to another screen
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleReset = async () => {
    if (isRecording) {
      await stopRecording();
    }
    setDuration(0);
  };

  // ... (in handleConfirm)
  const handleConfirm = async () => {
    if (isRecording) {
      await stopRecording();
    }

    if (recording) {
      const uri = recording.getURI();
      if (uri) {
        try {
          const filename = `Recording_${new Date().getTime()}.m4a`;
          console.log(`[Recording] Recording URI: ${uri}`);
          console.log(`[Recording] Filename: ${filename}`);
          console.log(`[Recording] Duration: ${formatTime(duration)}`);

          // Show processing modal
          setShowProcessingModal(true);
          setProcessingStage("Uploading...");
          setProcessingProgress(5);

          // Prepare FormData
          const formData = new FormData();
          formData.append("audio", {
            uri: uri,
            name: filename,
            type: "audio/m4a",
          });
          formData.append("title", filename);
          formData.append("duration", formatTime(duration));

          console.log("[Recording] Attempting to save recording to backend...");

          // Start polling for progress after a short delay (give backend time to save)
          setTimeout(() => {
            pollIntervalRef.current = setInterval(async () => {
              try {
                // Get the recording ID from the last saved recording
                // Note: This is a simplified approach - ideally get ID from initial response
                const progress = await authService.getRecordingProgress("temp");
                console.log("[Recording] Progress update:", progress);

                if (progress.stage) {
                  setProcessingStage(progress.stage);
                }
                if (progress.progress) {
                  setProcessingProgress(progress.progress);
                }

                // Stop polling if complete or failed
                if (progress.status === "complete" || progress.status === "failed") {
                  clearInterval(pollIntervalRef.current);
                }
              } catch (pollError) {
                console.log("[Recording] Progress poll error:", pollError);
              }
            }, 2000); // Poll every 2 seconds
          }, 1000);

          // Save to backend (this will wait for AI processing to complete)
          const result = await authService.saveRecording(formData);
          console.log("[Recording] Recording saved successfully:", result);

          // Stop polling
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }

          // Hide modal
          setShowProcessingModal(false);

          // Navigate to AudioPlayer with the enhanced audio
          navigation.navigate("AudioPlayer", {
            audioFile: {
              uri: result.enhancedAudioUrl || uri, // Use enhanced audio if available
              name: filename,
            },
            recording: result, // Pass the full recording object
          });
        } catch (error) {
          console.error("Failed to save recording:", error);

          // Stop polling and hide modal
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setShowProcessingModal(false);

          Alert.alert(
            "Error",
            "Failed to enhance audio. Please try again."
          );
        }
      }
    } else {
      Alert.alert("No Recording", "Please record something first.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
          <Text style={styles.headerTitle}>Recording Audio</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.timerContainer}>
            <View
              style={[
                styles.timerCircle,
                isRecording && styles.timerCircleActive,
              ]}
            >
              <Text style={styles.timerText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Control Bar */}
        <View style={styles.controlBar}>
          <View style={styles.controlContainer}>
            {/* Redo Button */}
            <TouchableOpacity style={styles.sideButton} onPress={handleReset}>
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Record Button */}
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={handleRecordToggle}
            >
              <View
                style={[
                  styles.recordButtonInner,
                  isRecording && styles.recordButtonInnerActive,
                ]}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={32}
                  color={isRecording ? "#FFFFFF" : colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity style={styles.sideButton} onPress={handleConfirm}>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Processing Modal */}
      <ProcessingModal
        visible={showProcessingModal}
        stage={processingStage}
        progress={processingProgress}
      />
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
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#1E1E2E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  timerCircleActive: {
    borderColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
    color: "#FFFFFF",
    fontFamily: "monospace", // Use monospace for numbers
  },
  controlBar: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  controlContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(30, 30, 50, 0.8)",
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40, // Pull up to break the container line
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonActive: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
  },
  recordButtonInnerActive: {
    backgroundColor: "#FF3B30",
  },
});

export default RecordingScreen;
