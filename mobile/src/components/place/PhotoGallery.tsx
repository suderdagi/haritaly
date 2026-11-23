import React, { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { assetUrl } from '@/src/api/client';
import { colors } from '@/src/theme';
import { Photo } from '@/src/types';
import { AppText } from '../ui/AppText';
import { IconButton } from '../ui/IconButton';

const pageOf = (e: NativeSyntheticEvent<NativeScrollEvent>, width: number) =>
  Math.round(e.nativeEvent.contentOffset.x / width);

/** Edge-to-edge photos at the top of a place, swiped page by page. Tapping one opens it full screen. */
export function PhotoCarousel({ photos, height = 320 }: { photos: Photo[]; height?: number }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [viewerAt, setViewerAt] = useState<number | null>(null);

  return (
    <View style={{ height }}>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p) => String(p.id)}
        onMomentumScrollEnd={(e) => setPage(pageOf(e, width))}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => setViewerAt(index)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Photo ${index + 1} of ${photos.length}. Opens full screen`}
          >
            <Image source={{ uri: assetUrl(item.url) }} style={{ width, height, backgroundColor: colors.fill }} />
          </Pressable>
        )}
      />
      {photos.length > 1 && (
        <View style={styles.counter} pointerEvents="none">
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <AppText variant="caption" style={styles.counterText} maxFontSizeMultiplier={1.2}>
            {page + 1} / {photos.length}
          </AppText>
        </View>
      )}
      <PhotoViewer photos={photos} startAt={viewerAt} onClose={() => setViewerAt(null)} />
    </View>
  );
}

/** Full-screen photos on black, swipe between them, close with the button. */
export function PhotoViewer({ photos, startAt, onClose }: { photos: Photo[]; startAt: number | null; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const list = useRef<FlatList<Photo>>(null);

  return (
    <Modal
      visible={startAt !== null}
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setPage(startAt ?? 0)}
      supportedOrientations={['portrait']}
    >
      <View style={styles.viewer}>
        <FlatList
          ref={list}
          data={photos}
          horizontal
          pagingEnabled
          initialScrollIndex={startAt ?? 0}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => String(p.id)}
          onMomentumScrollEnd={(e) => setPage(pageOf(e, width))}
          renderItem={({ item }) => (
            <Image source={{ uri: assetUrl(item.url) }} style={{ width, height }} resizeMode="contain" />
          )}
        />
        <View style={[styles.viewerBar, { top: insets.top + 8 }]}>
          <AppText variant="subheadMedium" style={styles.viewerCount}>
            {photos.length > 1 ? `${page + 1} of ${photos.length}` : ''}
          </AppText>
          <IconButton icon="close" accessibilityLabel="Close photo" onPress={onClose} color="#fff" size={40} style={styles.viewerClose} variant="plain" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  counter: {
    position: 'absolute',
    right: 14,
    bottom: 34,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(41, 45, 43, 0.35)',
  },
  counterText: {
    color: '#fff',
  },
  viewer: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewerBar: {
    position: 'absolute',
    left: 20,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewerCount: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  viewerClose: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
});
