import { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonIcon,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonBadge,
  IonNote,
} from '@ionic/react';
import {
  trophyOutline,
  personOutline,
  peopleOutline,
  calendarOutline,
  flameOutline,
  medalOutline,
  starOutline,
  timerOutline,
  fitnessOutline,
  heartOutline,
  leafOutline,
  sparklesOutline,
} from 'ionicons/icons';
import * as api from '../lib/api';

const LUCIDE_TO_IONICON = {
  Baby: personOutline,
  Users: peopleOutline,
  CalendarCheck: calendarOutline,
  Swords: flameOutline,
  Brain: fitnessOutline,
  Timer: timerOutline,
  Flame: flameOutline,
  CalendarHeart: calendarOutline,
  Trophy: medalOutline,
  Crown: starOutline,
  Clock: timerOutline,
  Hourglass: timerOutline,
  Star: starOutline,
  Sparkles: sparklesOutline,
  Leaf: leafOutline,
  Heart: heartOutline,
};

function getIonIcon(lucideName) {
  return LUCIDE_TO_IONICON[lucideName] || trophyOutline;
}

export function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([api.listAchievements(), api.getStats()]);
      setAchievements(a.results || a);
      setStats(s);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const doRefresh = async (e) => { await load(); e.target.complete(); };

  const progress = stats ? (stats.achievements_unlocked / stats.achievements_total) : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Logros</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-margin-bottom">
          <p className="section-subtitle">Logros</p>
          <h2 className="section-title">Tu camino de práctica</h2>
        </div>

        <IonCard className="ion-margin-bottom gradient-card" style={{borderRadius: '24px', padding: '28px 24px'}}>
          <div className="ion-text-center">
            <span className="icon-circle" style={{width: '72px', height: '72px', background: 'rgba(255,255,255,0.18)', color: '#fff', margin: '0 auto 14px'}}>
              <IonIcon icon={trophyOutline} size="large" />
            </span>
            <h2 style={{margin: '0 0 4px', fontFamily: 'var(--ion-font-serif)', fontSize: '2.5rem', fontWeight: 700, color: '#fff'}}>
              {stats?.achievements_unlocked ?? 0} de {stats?.achievements_total ?? 13}
            </h2>
            <p style={{margin: '0 0 18px', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem'}}>
              {Math.round(progress * 100)}% completado
            </p>
            <IonProgressBar value={progress} color="light" style={{height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.25)'}} />
          </div>
        </IonCard>

        {loading ? (
          <div className="ion-text-center ion-padding"><span className="spinner-dot" /></div>
        ) : (
          <IonGrid>
            <IonRow>
              {achievements.map(a => (
                <IonCol key={a.code} size="6" size-md="4" className="ion-margin-bottom">
                  <IonCard
                    className="card-elevated"
                    style={{
                      height: '100%',
                      borderRadius: '20px',
                      background: a.unlocked ? 'linear-gradient(135deg, var(--color-terracota-50) 0%, var(--color-arena-50) 100%)' : 'var(--ion-item-background)',
                      border: a.unlocked ? '2px solid var(--color-terracota-200)' : '1px solid var(--ion-border-color)',
                      opacity: a.unlocked ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <IonCardContent className="ion-text-center ion-padding">
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          margin: '0 auto 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: a.unlocked
                            ? 'linear-gradient(135deg, var(--color-terracota-500) 0%, var(--color-terracota-600) 100%)'
                            : 'var(--color-arena-200)',
                          color: a.unlocked ? '#fff' : 'var(--ion-color-medium)',
                          fontSize: '2rem',
                          boxShadow: a.unlocked ? '0 8px 20px -8px var(--color-terracota-500)' : 'none',
                        }}
                      >
                        <IonIcon icon={getIonIcon(a.icon)} />
                      </div>
                      <h3 style={{margin: '0 0 8px', fontFamily: 'var(--ion-font-serif)', fontSize: '1.1rem', fontWeight: 600, color: a.unlocked ? 'var(--ion-text-color)' : 'var(--ion-color-medium)'}}>
                        {a.title}
                      </h3>
                      <IonLabel color="medium" style={{fontSize: '0.875rem', lineHeight: 1.5}}>{a.description}</IonLabel>
                      {a.unlocked_at && (
                        <IonNote className="ion-margin-top" style={{fontSize: '0.75rem'}}>
                          Desbloqueado: {new Date(a.unlocked_at).toLocaleDateString('es-AR')}
                        </IonNote>
                      )}
                      {!a.unlocked && <IonBadge color="medium" className="ion-margin-top">Bloqueado</IonBadge>}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
}