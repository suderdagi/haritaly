import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
        <MaterialCommunityIcons name="creation" size={20} color="#6366f1" />
        <Text style={styles.title}>What friends say</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#6366f1" style={styles.spinner} />
      ) : summary?.status === 'OK' ? (
        <>
          <Text style={styles.summary}>{summary.summary}</Text>

          {summary.highlights.map((item) => (
            <View key={item} style={styles.row}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color="#10b981" />
              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}

          {summary.mustTry.length > 0 && (
            <Text style={styles.mustTry}>Must try: {summary.mustTry.join(', ')}</Text>
          )}

          <Text style={styles.footnote}>
            AI summary of {summary.mentionCount} saved {summary.mentionCount === 1 ? 'entry' : 'entries'}
          </Text>
        </>
      ) : summary?.status === 'NOT_ENOUGH_DATA' ? (
        <Text style={styles.muted}>
          Not enough notes or ratings yet. Add yours, or wait for friends to save this place.
        </Text>
      ) : (
        <>
          <Text style={styles.muted}>
            Get a short summary of the ratings, notes and favorites you and your friends saved here, written by
            OpenAI.
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity style={styles.button} onPress={handlePress} accessibilityLabel="Summarize with AI">
            <MaterialCommunityIcons name="creation" size={18} color="#fff" />
            <Text style={styles.buttonText}>{error ? 'Try again' : 'Summarize with AI'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  spinner: { marginVertical: 12 },
  summary: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  rowText: { fontSize: 15, color: '#333', flex: 1 },
  mustTry: { fontSize: 15, color: '#333', fontWeight: '600', marginTop: 6 },
  footnote: { fontSize: 12, color: '#9CA3AF', marginTop: 10 },
  muted: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  error: { fontSize: 14, color: '#FF3B30', marginTop: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
