import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonContent, IonSpinner } from '@ionic/react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { homeOutline, listOutline, timeOutline, trophyOutline, personOutline } from 'ionicons/icons';
import { HomePage } from '@pages/HomePage.jsx';
import { ClassesPage } from '@pages/ClassesPage.jsx';
import { ClassDetailPage } from '@pages/ClassDetailPage.jsx';
import { MeditationPage } from '@pages/MeditationPage.jsx';
import { AchievementsPage } from '@pages/AchievementsPage.jsx';
import { ProfilePage } from '@pages/ProfilePage.jsx';
import { LoginPage } from '@pages/LoginPage.jsx';
import { RegisterPage } from '@pages/RegisterPage.jsx';
import { ProtectedRoute } from '@components/ProtectedRoute.jsx';
import { useAuth } from '@context/AuthContext.jsx';

function LoadingScreen() {
  return (
    <IonApp>
      <IonContent>
        <div className="loading-brand">
          <div className="brand-mark">S</div>
          <p className="brand-name">Seba Yoga</p>
          <IonSpinner name="crescent" />
        </div>
      </IonContent>
    </IonApp>
  );
}

function PrivateTabs() {
  const { loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:id" element={<ClassDetailPage />} />
          <Route path="/meditation" element={<MeditationPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Inicio</IonLabel>
        </IonTabButton>
        <IonTabButton tab="classes" href="/classes">
          <IonIcon icon={listOutline} />
          <IonLabel>Clases</IonLabel>
        </IonTabButton>
        <IonTabButton tab="meditation" href="/meditation">
          <IonIcon icon={timeOutline} />
          <IonLabel>Meditar</IonLabel>
        </IonTabButton>
        <IonTabButton tab="achievements" href="/achievements">
          <IonIcon icon={trophyOutline} />
          <IonLabel>Logros</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}

export function App() {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <IonApp>
      <IonRouterOutlet>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/home" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/home" replace /> : <RegisterPage />} />
          <Route path="/*" element={user ? <PrivateTabs /> : <PrivateTabs />} />
        </Routes>
      </IonRouterOutlet>
    </IonApp>
  );
}