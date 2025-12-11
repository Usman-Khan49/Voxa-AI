import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/theme";

const { width } = Dimensions.get("window");

const ProcessingModal = ({ visible, stage, progress }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Animated indicator */}
                        <ActivityIndicator size="large" color="#fff" />

                        {/* Processing stage */}
                        <Text style={styles.stageText}>{stage}</Text>

                        {/* Progress percentage */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBackground}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${progress}%` },
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>{progress}%</Text>
                        </View>

                        {/* Info text */}
                        <Text style={styles.infoText}>
                            Please wait while we enhance your audio...
                        </Text>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: width * 0.85,
        borderRadius: 20,
        overflow: "hidden",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    gradient: {
        padding: 30,
        alignItems: "center",
    },
    stageText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 20,
        textAlign: "center",
    },
    progressContainer: {
        width: "100%",
        marginTop: 25,
        marginBottom: 15,
    },
    progressBarBackground: {
        width: "100%",
        height: 8,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "600",
        marginTop: 10,
        textAlign: "center",
    },
    infoText: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 15,
        textAlign: "center",
        fontStyle: "italic",
    },
});

export default ProcessingModal;
