import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CardProps = {
  title: string;
  children: ReactNode;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  badges?: Array<{
    label: string;
    color: string;
  }>;
};

export function Card({
  title,
  children,
  textColor,
  backgroundColor,
  borderColor,
  badges,
}: CardProps) {
  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {badges?.length ? (
          <View style={styles.badges}>
            {badges.map((badge) => (
              <View
                key={badge.label}
                style={[styles.badge, { backgroundColor: badge.color }]}
              >
                <Text style={styles.badgeText}>{badge.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
