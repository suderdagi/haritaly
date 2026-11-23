import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '@/src/theme';
import { Coordinates } from '@/src/lib/geo';
import { describeLocation } from '@/src/lib/address';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

/** After a long press on the map: confirm saving a new place at that spot. */
export function DraftSheet({
  coordinate,
  onAdd,
  onCancel,
}: {
  coordinate: Coordinates;
  onAdd: (address: string | null) => void;
  onCancel: () => void;
}) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setAddress(null);
    describeLocation(coordinate).then((text) => active && setAddress(text));
    return () => {
      active = false;
    };
  }, [coordinate]);

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.text}>
          <AppText variant="title2">Dropped pin</AppText>
          <AppText variant="subhead" tone="secondary" numberOfLines={2} style={styles.address}>
            {address ?? `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`}
          </AppText>
        </View>
        <IconButton icon="close" accessibilityLabel="Remove pin" onPress={onCancel} size={32} iconSize={17} />
      </View>
      <Button title="Save a place here" icon="add" onPress={() => onAdd(address)} haptic fullWidth style={styles.add} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
  },
  text: {
    flex: 1,
  },
  address: {
    marginTop: 2,
  },
  add: {
    marginTop: space.lg,
  },
});
