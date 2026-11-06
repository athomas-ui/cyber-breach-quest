import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import ScrollToTop from '@/components/ScrollToTop';
import GameProvider from '@/components/game/GameProvider';
import ScreenTransition from '@/components/game/ScreenTransition';
import Title from '@/pages/Title';
import CharacterSelect from '@/pages/CharacterSelect';
import Hub from '@/pages/Hub';
import MissionBait from '@/pages/MissionBait';
import Credits from '@/pages/Credits';

// No accounts and no server: the game boots straight to the title screen and
// saves progress in the browser (see src/game/store.js).
function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <GameProvider>
        <ScreenTransition>
          <Routes>
            <Route path="/" element={<Title />} />
            <Route path="/select" element={<CharacterSelect />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/mission/bait" element={<MissionBait />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </ScreenTransition>
      </GameProvider>
      <Toaster />
    </Router>
  );
}

export default App;
