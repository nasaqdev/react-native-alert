import React from 'react';
import {
  Appearance,
  StatusBar,
  View,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@yousofabouhalawareact-native-alert';
import { Card } from './components/Card';

export default function App() {
  const [scheme, setScheme] = React.useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'light' ? 'light' : 'dark'
  );
  const isDark = scheme === 'dark';
  const colors = {
    background: isDark ? '#0b0f1a' : '#f8fafc',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    card: isDark ? '#111827' : '#ffffff',
    cardBorder: isDark ? '#1f2937' : '#e2e8f0',
    button: isDark ? '#1b5efa' : '#2563eb',
    buttonText: '#ffffff',
    iosBadge: '#0ea5e9',
    androidBadge: '#22c55e',
  };

  React.useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setScheme(colorScheme === 'light' ? 'light' : 'dark');
      }
    });
    return () => subscription.remove();
  }, []);

  const toggleScheme = () => {
    const nextScheme = isDark ? 'light' : 'dark';
    if (typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(nextScheme);
    }
    setScheme(nextScheme);
  };

  const showLoadingExample = () => {
    let canceled = false;
    const dialog = Alert.show({
      title: 'Syncing',
      message: 'Uploading your changes...',
      loading: true,
      loadingColor: '#60a5fa',
      dismissable: false,
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {
            canceled = true;
            dialog?.dismiss();
          },
        },
      ],
      onDismiss: () => console.log('Loading alert dismissed'),
    });

    setTimeout(() => {
      dialog?.dismiss();
      if (canceled) {
        return;
      }
      Alert.show({
        title: 'Done',
        message: 'Upload complete.',
        buttons: [{ text: 'OK' }],
      });
    }, 1500);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                React Native Alert
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Fully native, customizable alerts
              </Text>
            </View>
            <Pressable
              style={[styles.toggle, { borderColor: colors.cardBorder }]}
              onPress={toggleScheme}
            >
              <Text style={[styles.toggleText, { color: colors.text }]}>
                {isDark ? 'Light' : 'Dark'}
              </Text>
            </Pressable>
          </View>

          <Card
            title="Example 1: Basic"
            textColor={colors.textMuted}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
            badges={[
              { label: 'iOS', color: colors.iosBadge },
              { label: 'Android', color: colors.androidBadge },
            ]}
          >
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Default alert with one button
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: colors.button }]}
              onPress={() =>
                Alert.show({
                  title: 'Hello',
                  message: 'This is the default alert.',
                  buttons: [{ text: 'OK' }],
                })
              }
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Show Alert
              </Text>
            </Pressable>
          </Card>

          <Card
            title="Example 2: iOS Action Sheet"
            textColor={colors.textMuted}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
            badges={[{ label: 'iOS', color: colors.iosBadge }]}
          >
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Preferred style actionSheet
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: colors.button }]}
              onPress={() =>
                Alert.show({
                  title: 'Options',
                  message: 'Choose an action',
                  iosPreferredStyle: 'actionSheet',
                  buttons: [
                    { text: 'Share', order: 0 },
                    { text: 'Delete', role: 'destructive', order: 1 },
                    { text: 'Cancel', role: 'cancel', order: 2 },
                  ],
                })
              }
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Show Action Sheet
              </Text>
            </Pressable>
          </Card>

          <Card
            title="Example 3: Two Buttons"
            textColor={colors.textMuted}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
            badges={[
              { label: 'iOS', color: colors.iosBadge },
              { label: 'Android', color: colors.androidBadge },
            ]}
          >
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Standard alert with two actions
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: colors.button }]}
              onPress={() =>
                Alert.show({
                  title: 'Enable notifications?',
                  message: 'You can change this later in Settings.',
                  buttons: [
                    { text: 'Not now', order: 1 },
                    { text: 'Allow', order: 0 },
                  ],
                })
              }
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Show Two-Button Alert
              </Text>
            </Pressable>
          </Card>

          <Card
            title="Example 4: Three Buttons"
            textColor={colors.textMuted}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
            badges={[
              { label: 'iOS', color: colors.iosBadge },
              { label: 'Android', color: colors.androidBadge },
            ]}
          >
            <Text style={[styles.note, { color: colors.textMuted }]}>
              order controls layout; roles affect iOS only
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: colors.button }]}
              onPress={() =>
                Alert.show({
                  title: 'Save changes?',
                  message: 'Choose how to proceed.',
                  buttons: [
                    { text: 'Save', order: 0 },
                    { text: 'Discard', role: 'destructive', order: 1 },
                    { text: 'Cancel', role: 'cancel', order: 2 },
                  ],
                })
              }
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Show Ordered Buttons
              </Text>
            </Pressable>
          </Card>

          <Card
            title="Example 5: Dismiss + Events"
            textColor={colors.textMuted}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
            badges={[{ label: 'Android', color: colors.androidBadge }]}
          >
            <Text style={[styles.note, { color: colors.textMuted }]}>
              dismissable + onDismiss (Android-only)
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: colors.button }]}
              onPress={() =>
                Alert.show({
                  title: 'Dismiss Demo',
                  message: 'Tap outside to dismiss.',
                  dismissable: true,
                  buttons: [{ text: 'OK' }],
                  onDismiss: () => console.log('Dismiss callback fired'),
                })
              }
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Show Dismiss Demo
              </Text>
            </Pressable>
          </Card>

          <Card
            title="Example 6: Loading"
            textColor={colors.textMuted}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
            badges={[{ label: 'Android', color: colors.androidBadge }]}
          >
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Android-only loading state
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: colors.button }]}
              onPress={showLoadingExample}
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Show Loading Flow
              </Text>
            </Pressable>
          </Card>

          <Card
            title="Example 7: Custom Android Styles"
            textColor={colors.textMuted}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
            badges={[{ label: 'Android', color: colors.androidBadge }]}
          >
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Rounded buttons, custom colors, ripples
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: colors.button }]}
              onPress={() =>
                Alert.show({
                  title: 'Signing in',
                  message: 'Checking your credentials...',
                  loading: true,
                  loadingColor: '#60a5fa',
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderWidth: 1,
                  cornerRadius: 22,
                  titleColor: '#f8fafc',
                  messageColor: '#cbd5f5',
                  buttons: [
                    {
                      text: 'Cancel',
                      textColor: '#94a3b8',
                      rippleColor: '#334155',
                      order: 1,
                    },
                    {
                      text: 'Retry',
                      textColor: '#60a5fa',
                      rippleColor: '#1d4ed8',
                      order: 0,
                    },
                  ],
                })
              }
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Show Custom Android
              </Text>
            </Pressable>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 20,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    width: '100%',
    marginTop: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
  },
  toggle: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    marginBottom: 10,
  },
});
