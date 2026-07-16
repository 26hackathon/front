import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, Platform, KeyboardAvoidingView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ui/themed-text';
import { useAuth } from '@/store/auth-context';
import { updateProfile, uploadToR2 } from '@/lib/api';
import { useAppStyles } from '@/hooks/use-app-styles';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const styles = useAppStyles(createStyles);
  
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(user?.profileImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }

    try {
      setIsUploading(true);
      
      let finalImageUrl = user.profileImageUrl || '';

      // If the user selected a new image (and it's a local file URI)
      if (profileImageUri && profileImageUri !== user.profileImageUrl) {
        // Upload to R2 and get object key (assuming we need to send the R2 URL or Key)
        const objectKey = await uploadToR2(
          profileImageUri,
          'IMAGE',
          'image/png', // strict fallback for API requirement
          1000000
        );
        // We will send the objectKey as the profileImageUrl (or we can format it if backend needs a full URL)
        // Adjust this if your backend expects a full URL instead of the key.
        finalImageUrl = objectKey; 
      }

      // 1. 백엔드 API 업데이트
      const updatedData = await updateProfile({
        id: user.id,
        nickname: nickname,
        profileImageUrl: finalImageUrl,
      });

      // 2. 로컬 상태(Context) 업데이트
      if (updatedData) {
        await updateUser({
          nickname: updatedData.nickname,
          profileImageUrl: updatedData.profileImageUrl,
        });
      }

      Alert.alert('성공', '프로필이 업데이트되었습니다.', [
        { text: '확인', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert('업데이트 실패', error.data?.error || error.message || '프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={styles.iconColor.color} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>프로필 수정</ThemedText>
        <Pressable onPress={handleSave} disabled={isUploading} style={styles.saveButton}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#FF2E2E" />
          ) : (
            <ThemedText style={styles.saveButtonText}>저장</ThemedText>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickImage} style={styles.avatarContainer}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.emptyAvatar]}>
                  <Ionicons name="person" size={40} color={styles.placeholderIcon.color} />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </Pressable>
            <ThemedText style={styles.avatarHint}>사진 변경</ThemedText>
          </View>

          {/* Nickname Input */}
          <View style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>닉네임</ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임을 입력하세요"
                placeholderTextColor="#8B8FA3"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {nickname.length > 0 && (
                <Pressable onPress={() => setNickname('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={18} color={styles.placeholderIcon.color} />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  iconColor: {
    color: colors.text,
  },
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
  },
  saveButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  content: {
    padding: 24,
    gap: 32,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardSecondary,
  },
  emptyAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  inputSection: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 4,
  },
});
