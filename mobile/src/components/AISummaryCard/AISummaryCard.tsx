import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/src/theme';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { placesAPI } from '@/src/api/places';
import { getErrorMessage } from '@/src/api/client';
import { getAppConfig } from '@/src/api/config';
import { AI_CONSENT_MESSAGE, hasAiConsent, setAiConsent } from '@/src/utils/aiConsent';
import { openWebPage } from '@/src/utils/openWebPage';
import { PlaceSummary } from '@/src/types';

/**
 * "What friends say" card. The summary is only requested when the user taps the button,
 * so opening a place never costs an AI call by itself.
 * The card is hidden when the server has no AI provider configured.
 */
export function AISummaryCard({ placeId }: { placeId: number }) {
  const [enabled, setEnabled] = useState(false);
  const [summary, setSummary] = useState<PlaceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAppConfig().then((config) => active && setEnabled(config.aiSummary));
    return () => {
      active = false;
    };
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await placesAPI.getPlaceSummary(placeId));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create a summary'));
    } finally {
      setLoading(false);
    }
  };

  // Nothing is sent to the AI provider until the user has agreed once
  const handlePress = async () => {
    if (await hasAiConsent()) {
      load();
      return;
    }
    Alert.alert('Share with OpenAI?', AI_CONSENT_MESSAGE, [
      { text: 'Privacy Policy', onPress: () => openWebPage('/privacy') },
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Allow',
        onPress: async () => {
          await setAiConsent(true);
          load();
        },
      },
    ]);
  };

  if (!enabled) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={14} color={colors.social} />
        </View>
        <AppText variant="headline">What friends say</AppText>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.textSecondary} style={styles.spinner} />
      ) : summary?.status === 'OK' ? (
        <>
          <AppText variant="body" style={styles.summary}>
            {summary.summary}
          </AppText>

          {summary.highlights.map((item) => (
            <View key={item} style={styles.row}>
              <Ionicons name="checkmark" size={16} color={colors.accent} />
              <AppText variant="callout" style={styles.rowText}>
                {item}
              </AppText>
            </View>
          ))}

          {summary.mustTry.length > 0 && (
            <AppText variant="calloutMedium" style={styles.mustTry}>
              Must try: {summary.mustTry.join(', ')}
            </AppText>
          )}

          <AppText variant="footnote" tone="tertiary" style={styles.footnote}>
            AI summary of {summary.mentionCount} saved {summary.mentionCount === 1 ? 'entry' : 'entries'}
          </AppText>
        </>
      ) : summary?.status === 'NOT_ENOUGH_DATA' ? (
        <AppText variant="callout" tone="secondary">
          Not enough notes yet. Add yours, or wait for friends to save this place.
        </AppText>
      ) : (
        <>
          <AppText variant="callout" tone="secondary">
            A short summary of the notes and favorites you and your friends saved here, written by OpenAI.
          </AppText>
          {error && (
            <AppText variant="footnote" tone="danger" style={styles.error}>
              {error}
            </AppText>
          )}
          <Button
            title={error ? 'Try again' : 'Summarize with AI'}
            icon="sparkles"
            variant="secondary"
            size="sm"
            onPress={handlePress}
            style={styles.button}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: space.xxl,
    padding: space.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.sm },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.socialSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: { marginVertical: space.sm },
  summary: { marginBottom: space.xs },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs, marginTop: space.xxs },
  rowText: { flex: 1 },
  mustTry: { marginTop: space.sm },
  footnote: { marginTop: space.sm },
  error: { marginTop: space.xs },
  button: { alignSelf: 'flex-start', marginTop: space.sm },
});
