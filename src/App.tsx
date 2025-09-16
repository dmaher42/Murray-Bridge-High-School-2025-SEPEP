import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SEPEPSportsHub from './SEPEPSportsHub';
import Neighbourhoods from './pages/Neighbourhoods';

const rawBase = ((import.meta as any).env?.BASE_URL ?? '/') as string;
const basename = rawBase.endsWith('/') && rawBase !== '/' ? rawBase.slice(0, -1) : rawBase;

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<SEPEPSportsHub />} />
        <Route path="/neighbourhoods" element={<Neighbourhoods />} />
        <Route path="*" element={<SEPEPSportsHub />} />
      </Routes>
    </BrowserRouter>
  );
}

