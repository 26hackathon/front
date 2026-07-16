import { useWindowDimensions, Platform } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Define breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const isWeb = Platform.OS === 'web';

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWeb,
    // Helper to determine if we should show desktop specific UI
    isLargeScreen: isDesktop || (isTablet && isWeb),
  };
}
