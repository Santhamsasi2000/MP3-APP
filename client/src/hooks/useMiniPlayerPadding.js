import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayer } from '../context/PlayerContext';
import { MINI_PLAYER_HEIGHT } from '../components/MiniPlayer';

export const useMiniPlayerPadding = () => {
  const { currentSong } = usePlayer();
  const insets = useSafeAreaInsets();
  
  if (currentSong) {
    return MINI_PLAYER_HEIGHT + insets.bottom + 10;
  }
  
  return insets.bottom + 10;
};