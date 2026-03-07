import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  Alert, 
  Modal, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  Dimensions,
  Platform
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Save original alert in case we want to fallback
const OriginalAlert = Alert.alert;

interface CustomButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertParams {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: CustomButton[];
  options?: any;
}

const { width, height } = Dimensions.get('window');

// Global reference to open function
let globalShowAlert: (title: string, message?: string, buttons?: CustomButton[], options?: any) => void;

export const CustomAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertParams>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    options: {}
  });

  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  // Set up the global override on mount
  useEffect(() => {
    globalShowAlert = (title: string, message?: string, buttons?: CustomButton[], options?: any) => {
      // Default to an OK button if none provided
      const defaultButtons: CustomButton[] = buttons && buttons.length > 0 
        ? buttons 
        : [{ text: 'OK', onPress: () => {} }];
        
      setAlertState({
        visible: true,
        title,
        message,
        buttons: defaultButtons,
        options
      });

      // Animate In
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
    };

    // Replace the OS Alert
    Alert.alert = globalShowAlert;

    // Cleanup
    return () => {
      Alert.alert = OriginalAlert;
    };
  }, []);

  const closeAlert = (onPressCallback?: () => void) => {
    // Animate Out
    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setAlertState(prev => ({ ...prev, visible: false }));
      if (onPressCallback) {
        // Small delay so UI is responsive
        setTimeout(onPressCallback, 10);
      }
    });
  };

  const getTheme = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lỗi') || t.includes('thất bại') || t.includes('error') || t.includes('fail')) {
      return {
        colors: ['#FFEBEE', '#FFCDD2'] as const,
        icon: 'error-outline' as const,
        iconColor: '#D32F2F',
        buttonColor: '#D32F2F',
        accentColor: '#FF5252'
      };
    }
    if (t.includes('thành công') || t.includes('success') || t.includes('hoàn tất')) {
      return {
        colors: ['#E8F5E9', '#C8E6C9'] as const,
        icon: 'check-circle-outline' as const,
        iconColor: '#388E3C',
        buttonColor: '#388E3C',
        accentColor: '#4CAF50'
      };
    }
    if (t.includes('xác nhận') || t.includes('cảnh báo') || t.includes('warning') || t.includes('chú ý')) {
      return {
        colors: ['#FFF8E1', '#FFECB3'] as const,
        icon: 'warning-amber' as const,
        iconColor: '#FFA000',
        buttonColor: '#FFA000',
        accentColor: '#FFB300'
      };
    }
    // Default info
    return {
      colors: ['#E3F2FD', '#BBDEFB'] as const,
      icon: 'info-outline' as const,
      iconColor: '#1976D2',
      buttonColor: '#003D5B',
      accentColor: '#2196F3'
    };
  };

  const theme = getTheme(alertState.title || '');

  return (
    <View style={{ flex: 1 }}>
      {children}
      
      <Modal
        visible={alertState.visible}
        transparent={true}
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => {
          if (alertState.options?.cancelable !== false) {
            closeAlert();
          }
        }}
      >
        <Animated.View style={[styles.backdrop, { opacity: opacityValue }]}>
          <TouchableOpacity 
            style={styles.backdropTouch} 
            activeOpacity={1} 
            onPress={() => {
              if (alertState.options?.cancelable !== false) {
                closeAlert();
              }
            }}
          />
          
          <Animated.View style={[styles.alertBox, { 
            transform: [{ scale: scaleValue }],
            opacity: opacityValue
          }]}>
            {/* Header Icon Section */}
            <LinearGradient
              colors={theme.colors}
              style={styles.iconHeader}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#fff', shadowColor: theme.accentColor }]}>
                <MaterialIcons name={theme.icon} size={36} color={theme.iconColor} />
              </View>
            </LinearGradient>

            {/* Content Section */}
            <View style={styles.contentContainer}>
              <ThemedText style={[styles.title, { color: '#1F2937' }]}>{alertState.title}</ThemedText>
              
              {!!alertState.message && (
                <ThemedText style={styles.message}>{alertState.message}</ThemedText>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {alertState.buttons?.map((btn, index) => {
                  const isCancel = btn.style === 'cancel';
                  const isDestructive = btn.style === 'destructive';
                  
                  // For a 2-button layout, they usually go side by side
                  // For a 3+ button layout, stack them
                  const buttonCount = alertState.buttons?.length || 1;
                  const buttonStyle = buttonCount > 2 ? styles.buttonStacked : styles.buttonRow;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      onPress={() => closeAlert(btn.onPress)}
                      style={[
                        styles.buttonBase,
                        buttonStyle,
                        // Apply appropriate colors
                        isCancel ? styles.buttonCancel : 
                        isDestructive ? { backgroundColor: '#FEE2E2', borderColor: '#EF4444' } :
                        { backgroundColor: theme.buttonColor },
                        
                        buttonCount === 2 && index === 0 && { marginRight: 12 } // Gap for side-by-side
                      ]}
                    >
                      <ThemedText style={[
                        styles.buttonText,
                        isCancel ? { color: '#6B7280' } :
                        isDestructive ? { color: '#EF4444' } :
                        { color: '#fff' }
                      ]}>
                        {btn.text || 'OK'}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  alertBox: {
    width: width * 0.85,
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  iconHeader: {
    height: 70,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: 32 }], // Ppush it half-way down into the content
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  contentContainer: {
    paddingTop: 45, // Make room for the overlapping icon
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flex: 1,
  },
  buttonStacked: {
    width: '100%',
    marginBottom: 10,
  },
  buttonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  }
});
