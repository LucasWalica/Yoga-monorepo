import { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonNote,
  IonChip,
} from '@ionic/react';
import { addOutline, timeOutline, schoolOutline, trophyOutline, playOutline, calendarOutline, flameOutline, personOutline, chevronForwardOutline, sparklesOutline, leafOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const levelLabels = {
  todos: 'Todos los niveles',
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const fmtRelative = (iso) => {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const hours = Math.ceil(diff / (1000 * 60 * 60));
  const minutes = Math.ceil(diff / (1000 * 60));
  if (days > 1) return `En ${days} días`;
  if (days === 1) return 'Mañana';
  if (hours > 0) return `En ${hours}h`;
  if (minutes > 0) return `En ${minutes}min`;
  return 'Ahora';
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

        {nextClass ? (
          <IonCard className="ion-margin-horizontal ion-margin-bottom card-elevated" style={{borderRadius: '24px', overflow: 'hidden', background: 'linear-gradient(135deg, var(--color-terracota-500) 0%, var(--color-terracota-600) 100%)', color: '#fff'}}>
            <IonCardHeader style={{padding: '24px 24px 0', borderBottom: 'none'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap'}}>
                <IonChip color="light" style={{fontWeight: 600}}><IonIcon icon={sparklesOutline} size="small" slot="start" /> Próxima clase en vivo</IonChip>
                <IonChip color="light" outline={true} style={{fontWeight: 500}}><IonIcon icon={timeOutline} size="small" slot="start" /> {fmtRelative(nextClass.scheduled_start)}</IonChip>
              </div>
              <IonCardTitle style={{fontFamily: 'var(--ion-font-serif)', fontSize: '1.5rem', fontWeight: 600, margin: 0}}>{nextClass.title}</IonCardTitle>
              <IonCardSubtitle style={{marginTop: '8px', opacity: 0.9}}>
                {nextClass.duration_minutes} min · {levelLabels[nextClass.level] || nextClass.level_display}
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent style={{padding: '0 24px 24px'}}>
              <div style={{aspectRatio: '16/9', width: '100%', borderRadius: '16px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', marginBottom: '16px'}}>
                <iframe src={ytEmbed(nextClass.youtube_url)} allowFullScreen style={{width: '100%', height: '100%', border: 0}} />
              </div>
              <IonButton
                expand="block"
                fill="outline"
                color="light"
                iconStart={true}
                icon={playOutline}
                onClick={() => navigate(`/classes/${nextClass.id}`)}
                style={{borderRadius: '12px', padding: '16px', fontWeight: 600, fontSize: '1rem'}}
              >
                Ver y asistir
                <IonIcon icon={chevronForwardOutline} slot="end" />
              </IonButton>
            </IonCardContent>
          </IonCard>
        ) : (
          <IonCard className="ion-margin-horizontal ion-margin-bottom card-elevated" style={{borderRadius: '24px', padding: '32px 24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--color-salvia-50) 0%, var(--color-arena-50) 100%)', border: '1px solid var(--color-salvia-200)'}}>
            <IonIcon icon={calendarOutline} size="large" color="secondary" style={{fontSize: '3rem', marginBottom: '16px'}} />
            <h2 style={{margin: '0 0 8px', fontFamily: 'var(--ion-font-serif)', fontSize: '1.5rem', fontWeight: 600}}>No hay clases programadas</h2>
            <p style={{margin: '0 0 16px', color: 'var(--ion-color-medium)'}}>Las próximas clases en vivo aparecerán aquí</p>
            <IonButton fill="outline" iconStart={true} icon={addOutline} onClick={() => navigate('/classes')}>
              Ver todas las clases
            </IonButton>
          </IonCard>
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
          <IonButton fill="clear" onClick={() => reload()}>Refrescar datos</IonButton>
        </IonNote>
      </IonContent>
    </IonPage>
  );
}