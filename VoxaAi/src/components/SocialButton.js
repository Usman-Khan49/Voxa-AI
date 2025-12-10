import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

const SocialButton = ({ provider, onPress }) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          icon: 'logo-google',
          label: 'Continue with Google',
          bgColor: 'rgba(255, 255, 255, 0.08)',
        };
      case 'apple':
        return {
          icon: 'logo-apple',
          label: 'Continue with Apple',
          bgColor: 'rgba(255, 255, 255, 0.08)',
        };
      case 'facebook':
        return {
          icon: 'logo-facebook',
          label: 'Continue with Facebook',
          bgColor: 'rgba(255, 255, 255, 0.08)',
        };
      default:
        return {
          icon: 'help-circle',
          label: 'Continue',
          bgColor: 'rgba(255, 255, 255, 0.08)',
        };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: config.bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={22} color={colors.textPrimary} />
      </View>
      <Text style={styles.label}>{config.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});

export default SocialButton;
