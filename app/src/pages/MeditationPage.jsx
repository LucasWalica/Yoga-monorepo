import { useEffect, useState, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonList,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
} from '@ionic/react';
import { alertController } from '@ionic/core';
import {
  playOutline,
  pauseOutline,
  musicalNotesOutline,
  timerOutline,
  checkmarkCircleOutline,
  refreshOutline,
  volumeMuteOutline,
  timeOutline,
  calendarOutline,
  leafOutline,
  cloudOutline,
  thunderstormOutline,
  sparklesOutline,
} from 'ionicons/icons';
import * as api from '@lib/api';

const sounds = [
  { name: 'Ruido blanco suave', url: 'https://assets.mixkit.co/music/preview/mixkit-ambient-lullaby-521.mp3', icon: cloudOutline },
  { name: 'Lluvia y truenos', url: 'https://assets.mixkit.co/music/preview/mixkit-rain-and-thunder-2318.mp3', icon: thunderstormOutline },
  { name: 'Campanas meditativas', url: 'https://assets.mixkit.co/music/preview/mixkit-meditative-bells-491.mp3', icon: sparklesOutline },
];

export function MeditationPage() {
  const [segment, setSegment] = useState('pomodoro');
  const [audios, setAudios] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const timerRef = useRef(null);

  const [soundPlaying, setSoundPlaying] = useState(null);
  const audioRef = useRef(new Audio());
  const [alertCtrl] = useState(() => alertController);

  const load = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([api.listAudioGuides(), api.listMySessions()]);
      setAudios(a.results || []);
      setSessions(s.results || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            finishCycle();
            return isWork ? breakMin * 60 : workMin * 60;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, isWork, workMin, breakMin]);

  const finishCycle = async () => {
    setRunning(false);
    setIsWork(!isWork);
    setSecondsLeft(isWork ? breakMin * 60 : workMin * 60);
    const mins = isWork ? workMin : breakMin;
    const type = isWork ? 'pomodoro' : 'meditation';
    try {
      await api.createMeditationSession({ minutes: mins, session_type: type });
      load();
    } catch {}
    const alert = await alertCtrl.create({
      header: isWork ? '¡Pomodoro completado!' : 'Descanso terminado',
      message: isWork ? `Descansa ${breakMin} min` : `Próximo pomodoro de ${workMin} min`,
      buttons: ['OK'],
    });
    alert.present();
    if (!isWork) {
      const a = await alertCtrl.create({ header: 'Continuar', buttons: ['Ahora', { text: 'Luego', role: 'cancel' }] });
      a.present();
      const { role } = await a.onDidDismiss();
      if (role !== 'cancel') startTimer();
    }
  };

  const startTimer = () => {
    if (secondsLeft <= 0) setSecondsLeft(isWork ? workMin * 60 : breakMin * 60);
    setRunning(true);
  };
  const pauseTimer = () => { setRunning(false); };
  const resetTimer = () => { pauseTimer(); setIsWork(true); setSecondsLeft(workMin * 60); };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' });

  const playSound = (url) => {
    if (soundPlaying === url) {
      audioRef.current.pause();
      setSoundPlaying(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
      setSoundPlaying(url);
    }
  };

  const stopSound = () => { audioRef.current.pause(); setSoundPlaying(null); };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Meditar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={async e => { await load(); e.target.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <IonSegment value={segment} onIonChange={e => setSegment(e.detail.value)}>
          <IonSegmentButton value="pomodoro"><IonLabel><IonIcon icon={timerOutline} /> Pomodoro</IonLabel></IonSegmentButton>
          <IonSegmentButton value="sounds"><IonLabel><IonIcon icon={musicalNotesOutline} /> Sonidos</IonLabel></IonSegmentButton>
          <IonSegmentButton value="history"><IonLabel><IonIcon icon={timeOutline} /> Historial</IonLabel></IonSegmentButton>
        </IonSegment>

        {segment === 'pomodoro' && (
          <>
            <div className="ion-margin-bottom" style={{borderRadius: '24px', background: 'linear-gradient(135deg, var(--color-salvia-50) 0%, var(--color-arena-50) 100%)', border: '1px solid var(--color-salvia-200)', padding: '36px 24px'}}>
              <div className="ion-text-center">
                <span className="badge badge-salvia">{isWork ? 'Enfoque' : 'Descanso'}</span>
                <div style={{fontSize: '4.5rem', fontWeight: 600, fontFamily: 'var(--ion-font-serif)', fontVariantNumeric: 'tabular-nums', color: 'var(--color-tinta-950)', lineHeight: 1.1, marginTop: '16px'}}>
                  {fmt(secondsLeft)}
                </div>
                <p style={{margin: '10px 0 0', color: 'var(--ion-color-medium)', fontSize: '0.875rem'}}>
                  {isWork ? 'Tiempo de enfoque' : 'Tiempo de descanso'} · {isWork ? `${workMin} min` : `${breakMin} min`}
                </p>
              </div>
            </div>

            <IonButton
              expand="block"
              size="large"
              fill="outline"
              color={running ? 'danger' : 'primary'}
              iconStart={true}
              icon={running ? pauseOutline : playOutline}
              onClick={running ? pauseTimer : startTimer}
              className="ion-margin-bottom btn-primary"
              style={{fontSize: '1.1rem', padding: '20px 32px'}}
            >
              {running ? 'Pausar' : 'Iniciar'}
            </IonButton>

            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonItem lines="none">
                    <IonLabel position="floating">Trabajo (min)</IonLabel>
                    <IonInput
                      type="number"
                      min="1"
                      max="120"
                      value={workMin}
                      onIonChange={e => setWorkMin(parseInt(e.detail.value || '25'))}
                      disabled={running}
                      className="ion-text-center"
                      style={{fontSize: '1.5rem'}}
                    />
                  </IonItem>
                </IonCol>
                <IonCol>
                  <IonItem lines="none">
                    <IonLabel position="floating">Descanso (min)</IonLabel>
                    <IonInput
                      type="number"
                      min="1"
                      max="60"
                      value={breakMin}
                      onIonChange={e => setBreakMin(parseInt(e.detail.value || '5'))}
                      disabled={running}
                      className="ion-text-center"
                      style={{fontSize: '1.5rem'}}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonButton
              expand="block"
              fill="outline"
              iconStart={true}
              icon={refreshOutline}
              onClick={resetTimer}
              disabled={!running && secondsLeft === workMin * 60}
              className="ion-margin-top"
            >
              Reiniciar
            </IonButton>
          </>
        )}

        {segment === 'sounds' && (
          <>
            <IonText color="medium"><h3 className="ion-padding-start section-subtitle">Generadores de ambiente</h3></IonText>
            <IonList lines="none">
              {sounds.map((s, i) => (
                <IonItem key={i} button onClick={() => playSound(s.url)} className="ion-margin-horizontal card-elevated" style={{borderRadius: '16px', marginBottom: '12px', '--padding-start': '12px'}}>
                  <span className="icon-circle" style={{background: 'var(--color-salvia-100)', color: 'var(--color-salvia-600)', marginRight: '12px'}}>
                    <IonIcon icon={s.icon} size="large" />
                  </span>
                  <IonLabel className="ion-padding-top ion-padding-bottom">{s.name}</IonLabel>
                  {soundPlaying === s.url && <IonIcon slot="end" icon={checkmarkCircleOutline} color="success" />}
                </IonItem>
              ))}
            </IonList>
            {soundPlaying && (
              <IonButton expand="block" color="danger" iconStart={true} icon={volumeMuteOutline} onClick={stopSound} className="ion-margin-top ion-margin-horizontal">
                Detener sonido
              </IonButton>
            )}

            <IonText color="medium"><h3 className="ion-padding-start ion-margin-top section-subtitle">Audios guiados</h3></IonText>
            {loading ? (
              <div className="ion-text-center ion-padding"><IonSpinner name="crescent" /></div>
            ) : audios.length === 0 ? (
              <IonText color="medium" className="ion-padding ion-text-center">No hay audios disponibles</IonText>
            ) : (
              <IonList lines="none">
                {audios.map(a => (
                  <IonItem key={a.id} button onClick={() => a.resolved_url && playSound(a.resolved_url)} className="ion-margin-horizontal card-elevated" style={{borderRadius: '16px', marginBottom: '12px', '--padding-start': '12px'}}>
                    <span className="icon-circle" style={{background: 'var(--color-terracota-100)', color: 'var(--color-terracota-600)', marginRight: '12px'}}>
                      <IonIcon icon={musicalNotesOutline} size="large" />
                    </span>
                    <IonLabel className="ion-padding-top ion-padding-bottom">
                      <h3 style={{margin: 0, fontSize: '1rem', fontWeight: 600}}>{a.title}</h3>
                      <p style={{margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--ion-color-medium)'}}>
                        <span className="badge badge-arena">{a.category_display}</span>
                        {' '}
                        <span className="badge badge-arena">{a.duration_minutes} min</span>
                      </p>
                    </IonLabel>
                    <IonIcon slot="end" icon={soundPlaying === a.resolved_url ? pauseOutline : playOutline} color={soundPlaying === a.resolved_url ? 'success' : 'medium'} />
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}

        {segment === 'history' && (
          <>
            <IonText color="medium"><h3 className="ion-padding-start section-subtitle">Tus sesiones recientes</h3></IonText>
            {loading ? (
              <div className="ion-text-center ion-padding"><IonSpinner name="crescent" /></div>
            ) : sessions.length === 0 ? (
              <div className="ion-text-center ion-padding" style={{padding: '48px 16px'}}>
                <IonIcon icon={calendarOutline} size="large" color="medium" style={{fontSize: '3rem', marginBottom: '16px'}} />
                <h3 style={{margin: '0 0 8px', color: 'var(--ion-text-color)'}}>Sin sesiones aún</h3>
                <p style={{margin: 0, color: 'var(--ion-color-medium)'}}>Tu historial de meditación y pomodoros aparecerá aquí</p>
              </div>
            ) : (
              <IonList lines="none">
                {sessions.slice(0, 20).map(s => (
                  <IonItem key={s.id} className="ion-margin-horizontal card-elevated" style={{borderRadius: '16px', marginBottom: '12px', '--padding-start': '12px'}}>
                    <span className="icon-circle" style={{background: s.session_type === 'pomodoro' ? 'var(--color-terracota-100)' : 'var(--color-salvia-100)', color: s.session_type === 'pomodoro' ? 'var(--color-terracota-600)' : 'var(--color-salvia-600)', marginRight: '12px'}}>
                      <IonIcon icon={s.session_type === 'pomodoro' ? timerOutline : leafOutline} size="large" />
                    </span>
                    <IonLabel className="ion-padding-top ion-padding-bottom">
                      <h3 style={{margin: 0, fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize'}}>{s.session_type_display || s.session_type}</h3>
                      <p style={{margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--ion-color-medium)'}}>
                        <IonIcon icon={timeOutline} size="small" style={{marginRight: '4px', verticalAlign: '-2px'}} /> {s.minutes} min ·{' '}
                        <IonIcon icon={calendarOutline} size="small" style={{marginRight: '4px', verticalAlign: '-2px'}} /> {fmtDate(s.created_at)}
                      </p>
                    </IonLabel>
                    <IonIcon slot="end" icon={s.session_type === 'pomodoro' ? timerOutline : leafOutline} color={s.session_type === 'pomodoro' ? 'primary' : 'secondary'} />
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}

        <IonNote className="ion-text-center ion-padding ion-margin-top">
          Cada sesión suma minutos y desbloquea logros de meditación / pomodoro.
        </IonNote>
      </IonContent>
    </IonPage>
  );
}