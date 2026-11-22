import { AuthProvider } from './features/auth/context/AuthContext';
import AppRouter, { navigate } from './router';

export default function App() {
  return (
    <AuthProvider redirect={navigate}>
      <AppRouter />
    </AuthProvider>
  );
}
