import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Upload from './pages/Upload';
import Live from './pages/Live';
import Messages from './pages/Messages';
import Call from './pages/Call';
import Admin from './pages/Admin';
import SignIn from './pages/SignIn';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/live" element={<Live />} />
          <Route path="/live/:id" element={<Live />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/call" element={<Call />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}