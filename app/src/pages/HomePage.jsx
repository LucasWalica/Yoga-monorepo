import { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonNote,
} from '@ionic/react';
import { timeOutline, schoolOutline, trophyOutline, playOutline, calendarOutline, flameOutline, personOutline, chevronForwardOutline, sparklesOutline, leafOutline, refreshOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const levelLabels = {
  todos: 'Todos los niveles',
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const ytEmbed = (url) => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
};

export function HomePage() {
  const { user, reload } = useAuth();
  const navigate = useNavigate();
  const [nextClass, setNextClass] = useState(null);
  const [stats, setStats] = useState(null);
  const [, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [classesRes, statsRes] = await Promise.all([
        api.listLiveClasses(),
        api.getStats(),
      ]);
      if (classesRes.results?.length) setNextClass(classesRes.results[0]);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const doRefresh = async (ev) => { await load(); ev.target.complete(); };

  const firstName = user?.full_name?.split(' ')[0] || 'alumno';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Seba Yoga</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{paddingTop: '0'}}>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding-horizontal ion-margin-bottom">
          <div className="hero-banner">
            <img
              className="hero-img"
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop"
              alt="Persona practicando yoga al amanecer"
            />
            <div className="hero-overlay" />
            <div className="hero-content">
              <span className="hero-pill">
                <IonIcon icon={sparklesOutline} size="small" />
                Tu espacio de yoga
              </span>
              <h1 className="section-title" style={{ color: '#fff', fontWeight: 600, marginTop: '14px' }}>
                Hola, {firstName}
              </h1>
              <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Encontrá tu equilibrio, <span className="serif-italic" style={{ color: 'var(--color-arena-200)' }}>una respiración a la vez</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="ion-padding-horizontal ion-margin-bottom ion-margin-top">
          <p className="section-subtitle">Clases programadas</p>
          <h2 className="section-title">Próximas en vivo</h2>
        </div>

        {nextClass ? (
          <IonCard className="ion-margin-horizontal ion-margin-bottom card-elevated" style={{borderRadius: '24px', overflow: 'hidden'}}>
            <div style={{position: 'relative'}}>
              <div style={{aspectRatio: '16/9', width: '100%', background: '#000'}}>
                <iframe src={ytEmbed(nextClass.youtube_url)} title={nextClass.title} allowFullScreen style={{width: '100%', height: '100%', border: 0}} />
              </div>
              <span className="live-pill" style={{position: 'absolute', top: '12px', left: '12px'}}>
                <span className="live-dot" /> Próxima clase en vivo
              </span>
            </div>
            <IonCardContent style={{padding: '20px'}}>
              <h2 style={{margin: '0 0 14px', fontFamily: 'var(--ion-font-serif)', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25, color: 'var(--ion-text-color)'}}>{nextClass.title}</h2>
              <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                <span className="meta-pill"><IonIcon icon={calendarOutline} size="small" /> {new Date(nextClass.scheduled_start).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
                <span className="meta-pill"><IonIcon icon={timeOutline} size="small" /> {nextClass.duration_minutes} min</span>
                <span className="meta-pill"><IonIcon icon={leafOutline} size="small" /> {levelLabels[nextClass.level] || nextClass.level_display}</span>
              </div>
              <IonButton expand="block" className="btn-primary" style={{marginTop: '18px', padding: '20px 24px', fontSize: '1.05rem'}} onClick={() => navigate(`/classes/${nextClass.id}`)}>
                <IonIcon icon={playOutline} slot="start" /> Ver y asistir
              </IonButton>
            </IonCardContent>
          </IonCard>
        ) : (
          <div className="ion-margin-horizontal ion-margin-bottom empty-card">
            <span className="icon-circle icon-circle-lg" style={{background: 'var(--color-salvia-100)', color: 'var(--color-salvia-600)', margin: '0 auto 18px'}}>
              <IonIcon icon={leafOutline} size="large" />
            </span>
            <h2 className="empty-title">Nada agendado todavía</h2>
            <p className="empty-text">Las próximas clases en vivo van a aparecer acá. Mientras tanto, una meditación te espera.</p>
            <div className="empty-actions">
              <IonButton expand="block" className="btn-primary" onClick={() => navigate('/classes')}>
                Ver todas las clases <IonIcon icon={chevronForwardOutline} slot="end" />
              </IonButton>
              <IonButton expand="block" className="btn-ghost" onClick={() => navigate('/meditation')}>
                Meditar ahora <IonIcon icon={leafOutline} slot="end" />
              </IonButton>
            </div>
          </div>
        )}

        <div className="ion-padding-horizontal ion-margin-bottom">
          <p className="section-subtitle">Resumen</p>
          <h2 className="section-title">Tu progreso</h2>
        </div>

        <IonGrid className="ion-padding-horizontal ion-margin-bottom">
          <IonRow>
            <IonCol size="6">
              <IonCard className="h-100 card-elevated" style={{borderRadius: '20px', textAlign: 'center', padding: '20px 16px'}}>
                <IonCardContent>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'}}>
                    <span className="icon-circle" style={{background: 'var(--color-salvia-100)', color: 'var(--color-salvia-600)'}}>
                      <IonIcon icon={flameOutline} size="large" />
                    </span>
                  </div>
                  <div style={{fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-text-color)'}}>{stats?.streak_days ?? 0}</div>
                  <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Días de racha</div>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard className="h-100 card-elevated" style={{borderRadius: '20px', textAlign: 'center', padding: '20px 16px'}}>
                <IonCardContent>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'}}>
                    <span className="icon-circle" style={{background: 'var(--color-terracota-100)', color: 'var(--color-terracota-600)'}}>
                      <IonIcon icon={schoolOutline} size="large" />
                    </span>
                  </div>
                  <div style={{fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-text-color)'}}>{stats?.classes_attended ?? 0}</div>
                  <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Clases</div>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard className="h-100 card-elevated" style={{borderRadius: '20px', textAlign: 'center', padding: '20px 16px'}}>
                <IonCardContent>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'}}>
                    <span className="icon-circle" style={{background: 'var(--color-terracota-100)', color: 'var(--color-terracota-600)'}}>
                      <IonIcon icon={trophyOutline} size="large" />
                    </span>
                  </div>
                  <div style={{fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-text-color)'}}>{stats?.achievements_unlocked ?? 0}/{stats?.achievements_total ?? 13}</div>
                  <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Logros</div>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard className="h-100 card-elevated" style={{borderRadius: '20px', textAlign: 'center', padding: '20px 16px'}}>
                <IonCardContent>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'}}>
                    <span className="icon-circle" style={{background: 'var(--color-salvia-100)', color: 'var(--color-salvia-600)'}}>
                      <IonIcon icon={timeOutline} size="large" />
                    </span>
                  </div>
                  <div style={{fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-text-color)'}}>{stats?.total_minutes ?? 0} min</div>
                  <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Minutos</div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {stats && stats.minutes_last_7_days !== undefined && (
          <IonCard className="ion-margin-horizontal ion-margin-bottom card-elevated" style={{borderRadius: '20px', padding: '20px 24px', background: 'var(--color-salvia-50)', border: '1px solid var(--color-salvia-200)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <span className="icon-circle-sm" style={{background: 'var(--color-salvia-100)', color: 'var(--color-salvia-600)'}}>
                <IonIcon icon={calendarOutline} size="large" />
              </span>
              <div>
                <div style={{fontSize: '1rem', fontWeight: 600, color: 'var(--ion-text-color)'}}>Esta semana</div>
                <div style={{fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-color-primary)'}}>{stats.minutes_last_7_days} min</div>
              </div>
              <div style={{marginLeft: 'auto', textAlign: 'right'}}>
                <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Minutos practicados</div>
              </div>
            </div>
          </IonCard>
        )}

        <div className="ion-padding-horizontal ion-margin-bottom">
          <p className="section-subtitle">Accesos rápidos</p>
        </div>

        <IonGrid className="ion-padding-horizontal ion-margin-bottom">
          <IonRow>
            <IonCol size="6">
              <div className="tile" onClick={() => navigate('/classes')}>
                <span className="icon-circle" style={{ background: 'var(--color-salvia-100)', color: 'var(--color-salvia-600)' }}>
                  <IonIcon icon={schoolOutline} size="large" />
                </span>
                <span className="tile-label">Ver clases</span>
              </div>
            </IonCol>
            <IonCol size="6">
              <div className="tile" onClick={() => navigate('/meditation')}>
                <span className="icon-circle" style={{ background: 'var(--color-terracota-100)', color: 'var(--color-terracota-600)' }}>
                  <IonIcon icon={leafOutline} size="large" />
                </span>
                <span className="tile-label">Meditar</span>
              </div>
            </IonCol>
            <IonCol size="6">
              <div className="tile" onClick={() => navigate('/achievements')}>
                <span className="icon-circle" style={{ background: 'var(--color-terracota-100)', color: 'var(--color-terracota-600)' }}>
                  <IonIcon icon={trophyOutline} size="large" />
                </span>
                <span className="tile-label">Logros</span>
              </div>
            </IonCol>
            <IonCol size="6">
              <div className="tile" onClick={() => navigate('/profile')}>
                <span className="icon-circle" style={{ background: 'var(--color-salvia-100)', color: 'var(--color-salvia-600)' }}>
                  <IonIcon icon={personOutline} size="large" />
                </span>
                <span className="tile-label">Perfil</span>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonNote className="ion-text-center ion-padding">
          <IonButton fill="clear" size="small" className="btn-ghost" onClick={() => reload()}>
            <IonIcon icon={refreshOutline} slot="start" /> Refrescar datos
          </IonButton>
        </IonNote>
      </IonContent>
    </IonPage>
  );
}