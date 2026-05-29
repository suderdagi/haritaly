import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Place } from '@/src/types';

interface MapPinProps {
  place: Place;
  isUserPlace: boolean;
  onPress?: () => void;
}

export const MapPin: React.FC<MapPinProps> = ({ place, isUserPlace, onPress }) => {
  const ratingValue = Number(place.rating ?? 0);
  const safeRating = Number.isFinite(ratingValue) ? ratingValue : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.pinContainer, isUserPlace ? styles.userPin : styles.friendPin]}>
        <MaterialCommunityIcons
          name={isUserPlace ? 'heart' : 'map-marker'}
          size={20}
          color="#fff"
        />
      </View>
      <View style={styles.label}>
        <Text style={styles.placeName} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.rating}>
          
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pinContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userPin: {
    backgroundColor: '#6366f1', // Indigo
  },
  friendPin: {
    backgroundColor: '#ec4899', // Pink
  },
  label: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  placeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  rating: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 2,
  },
});
