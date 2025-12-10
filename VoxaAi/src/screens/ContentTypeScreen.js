import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const contentTypes = [
  { id: 'Marketing', label: 'Marketing & Ads' },
  { id: 'YouTube', label: 'YouTube Videos & Shorts' },
  { id: 'Education', label: 'Education' },
  { id: 'Social Media', label: 'Social Media' },
  { id: 'Podcasts', label: 'Podcasts' },
  { id: 'Personal Only', label: 'Personal Only' },
  { id: 'Other', label: 'Other' },
];

const ContentTypeScreen = ({ navigation, route }) => {
  const [selectedType, setSelectedType] = useState(null);
  const role = route?.params?.role;

  const handleContinue = () => {
    if (selectedType) {
      navigation.navigate('CompleteProfile', { role, contentType: selectedType });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Noise overlay */}
        <Image
          source={require('../../assets/noise.png')}
          style={styles.noiseOverlay}
          resizeMode="repeat"
        />

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

            {/* Progress Indicator - Step 2 of 3 */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, styles.progressBarActive]} />
              <View style={[styles.progressBar, styles.progressBarActive]} />
              <View style={styles.progressBar} />
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Content Type? 🎙️</Text>
            <Text style={styles.subtitle}>Choose all the content types you plan to create. </Text>
          </View>

          {/* Content Type Options */}
          <View style={styles.optionsContainer}>
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionCard,
                  selectedType === type.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  {/* Removed icon container */}
                  <Text style={[
                    styles.optionLabel,
                    selectedType === type.id && styles.optionLabelSelected,
                  ]}>
                    {type.label}
                  </Text>
                </View>
                
                {/* Radio Button */}
                <View style={[
                  styles.radioOuter,
                  selectedType === type.id && styles.radioOuterSelected,
                ]}>
                  {selectedType === type.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedType && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!selectedType}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedType && styles.continueButtonTextDisabled,
            ]}>
              Continue
            </Text>
          </TouchableOpacity>
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
    position: 'absolute',
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
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressBarActive: {
    backgroundColor: colors.primary,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(3, 124, 198, 0.15)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // iconContainer: { // Removed
  //   width: 44,
  //   height: 44,
  //   borderRadius: 22,
  //   backgroundColor: 'rgba(255, 255, 255, 0.1)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginRight: 16,
  // },
  // iconContainerSelected: { // Removed
  //   backgroundColor: colors.primary,
  // },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A0A0A0',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A0A0A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: '#A0A0A0',
  },
});

export default ContentTypeScreen;
