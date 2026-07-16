import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ui/themed-text';
import { createPost, uploadToR2 } from '@/lib/api';
import { useAppStyles } from '@/hooks/use-app-styles';

export default function CreatePostModal() {
  const router = useRouter();
  const styles = useAppStyles(createStyles);
  const [title, setTitle] = useState('');

  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setThumbnailUri(result.assets[0].uri);
    }
  };

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !thumbnailUri || !videoUri) {
      Alert.alert('알림', '제목, 썸네일, 동영상을 모두 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Upload thumbnail to R2
      const thumbnailKey = await uploadToR2(
        thumbnailUri,
        'IMAGE',
        'image/jpeg',
        // Pass dummy size or get from picker result if stored.
        1000000
      );

      // 2. Upload video to R2
      const videoKey = await uploadToR2(
        videoUri,
        'VIDEO',
        'video/mp4',
        5000000
      );

      // 3. Create Post
      await createPost({
        title,
        thumbnailImageObjectKey: thumbnailKey,
        videoObjectKey: videoKey,
      });

      Alert.alert('성공', '게시글이 성공적으로 등록되었습니다.', [
        { text: '확인', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error('Submit post error:', error);
      Alert.alert('업로드 실패', '게시글을 올리는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>새 게시글</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Title Input */}
          <View style={styles.inputSection}>
            <ThemedText style={styles.label}>제목</ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="작품의 멋진 이름을 지어주세요"
              placeholderTextColor="#5C6079"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          {/* Media Section */}
          <View style={styles.mediaSection}>
            {/* Thumbnail Picker */}
            <View style={styles.mediaBoxWrapper}>
              <ThemedText style={styles.label}>썸네일 이미지</ThemedText>
              <TouchableOpacity style={styles.mediaBox} onPress={handlePickThumbnail} activeOpacity={0.8}>
                {thumbnailUri ? (
                  // Preview logic would go here
                  <View style={styles.mediaBoxContent}>
                    <Ionicons name="image" size={32} color="#FF2E2E" />
                    <ThemedText style={styles.mediaText}>선택됨</ThemedText>
                  </View>
                ) : (
                  <View style={styles.mediaBoxContent}>
                    <Ionicons name="add" size={32} color={styles.placeholderIcon.color} />
                    <ThemedText style={styles.mediaPlaceholder}>썸네일 선택</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Video Picker */}
            <View style={styles.mediaBoxWrapper}>
              <ThemedText style={styles.label}>동영상</ThemedText>
              <TouchableOpacity style={styles.mediaBox} onPress={handlePickVideo} activeOpacity={0.8}>
                {videoUri ? (
                  <View style={styles.mediaBoxContent}>
                    <Ionicons name="videocam" size={32} color="#FF2E2E" />
                    <ThemedText style={styles.mediaText}>선택됨</ThemedText>
                  </View>
                ) : (
                  <View style={styles.mediaBoxContent}>
                    <Ionicons name="add" size={32} color={styles.placeholderIcon.color} />
                    <ThemedText style={styles.mediaPlaceholder}>영상 선택</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (!title || !thumbnailUri || !videoUri || isLoading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!title || !thumbnailUri || !videoUri || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitButtonText}>게시하기</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  placeholderIcon: {
    color: colors.textMuted,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    width: 36, // To balance the close button width
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 32,
  },
  inputSection: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaSection: {
    flexDirection: 'row',
    gap: 16,
  },
  mediaBoxWrapper: {
    flex: 1,
    gap: 12,
  },
  mediaBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mediaBoxContent: {
    alignItems: 'center',
    gap: 8,
  },
  mediaPlaceholder: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  mediaText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 24,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF', // Button text usually stays white
    fontSize: 16,
    fontWeight: '700',
  },
});
