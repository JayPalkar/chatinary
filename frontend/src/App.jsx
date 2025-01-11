import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/homePage";
import LoginPage from "./pages/loginPage";
import SettingsPage from "./pages/settingsPage";
import ProfilePage from "./pages/profilePage";
import { useAuthenticationStore } from "./store/useAuthenticationStore";
import { useEffect } from "react";

const App = () => {
  const { authUser, checkAuthentication } = useAuthenticationStore();

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  console.log({ authUser });

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
};

export default App;
