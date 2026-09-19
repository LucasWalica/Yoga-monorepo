import { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonNote,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
} from '@ionic/react';
import { alertController } from '@ionic/core';
import { arrowBackOutline, checkmarkCircleOutline, timeOutline, personAddOutline, calendarOutline, peopleOutline, videocamOutline } from 'ionicons/icons';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '@lib/api';

const levelLabels = {
  todos: 'Todos los niveles',
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const statusBadge = {
  'Próxima': 'badge-salvia',
  'En vivo': 'badge-terracota',
  'En vivo ahora': 'badge-terracota',
  'Finalizada': 'badge-arena',
};

const levelBadge = {
  todos: 'badge-arena',
  principiante: 'badge-salvia',
  intermedio: 'badge-terracota',
  avanzado: 'badge-terracota',
};

export function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const [alertCtrl] = useState(() => alertController);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getClassDetail(id);
      setCls(data);
    } catch {
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  const handleAttend = async () => {
    setAttending(true);
    try {
      await api.attendClass(id);
      load();
    } catch (e) {
      const alert = await alertCtrl.create({ header: 'Error', message: e.data?.detail || 'No se pudo registrar', buttons: ['OK'] });
      alert.present();
    } finally {
      setAttending(false);
    }
  };

  const fmt = (iso) => new Date(iso).toLocaleString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' });
  const ytEmbed = (url) => {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&\n?#]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
  };

  const getStatus = (cls) => {
    const now = new Date();
    const start = new Date(cls.scheduled_start);
    const end = new Date(start.getTime() + cls.duration_minutes * 60000);
    if (now < start) return { label: 'Próxima', color: 'primary', icon: calendarOutline };
    if (now >= start && now <= end) return { label: 'En vivo ahora', color: 'danger', icon: videocamOutline };
    return { label: 'Finalizada', color: 'medium', icon: timeOutline };
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent><div className="ion-text-center ion-padding"><span className="spinner-dot" /></div></IonContent>
      </IonPage>
    );
  }
  if (!cls) return null;

  const status = getStatus(cls);
  const levelLabel = levelLabels[cls.level] || cls.level_display;
  const capacityPercent = cls.capacity ? Math.min(100, (cls.attendees_count / cls.capacity) * 100) : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => navigate('/classes')}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Detalle de clase</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{aspectRatio: '16/9', width: '100%', borderRadius: '24px', overflow: 'hidden', background: '#000', marginBottom: '20px', boxShadow: 'var(--shadow-lg)'}}>
          <iframe src={ytEmbed(cls.youtube_url)} title={cls.title} allowFullScreen style={{width: '100%', height: '100%', border: 0}} />
        </div>

        <div className="ion-margin-bottom" style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <span className={`badge ${statusBadge[status.label] || statusBadge.Finalizada}`}>
            <IonIcon icon={status.icon} size="small" style={{marginRight: '4px', verticalAlign: '-2px'}} /> {status.label}
          </span>
          <span className={`badge ${levelBadge[cls.level] || 'badge-arena'}`}>{levelLabel}</span>
          {cls.capacity && <span className="badge badge-arena"><IonIcon icon={peopleOutline} size="small" style={{marginRight: '4px', verticalAlign: '-2px'}} /> {cls.attendees_count} / {cls.capacity}</span>}
        </div>

        <h1 style={{margin: '8px 0 16px', fontFamily: 'var(--ion-font-serif)', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.25}}>{cls.title}</h1>

        <IonCard className="ion-margin-bottom card-elevated" style={{borderRadius: '20px'}}>
          <IonCardContent className="ion-padding">
            <IonGrid>
              <IonRow>
                <IonCol size="6" className="ion-text-center ion-padding-vertical" style={{borderRight: '1px solid var(--ion-border-color)'}}>
                  <IonIcon icon={calendarOutline} size="large" color="primary" style={{marginBottom: '8px'}} />
                  <div style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--ion-text-color)'}}>{fmtDate(cls.scheduled_start)}</div>
                  <div style={{fontSize: '0.875rem', color: 'var(--ion-color-medium)'}}>{fmt(cls.scheduled_start)}</div>
                </IonCol>
                <IonCol size="6" className="ion-text-center ion-padding-vertical">
                  <IonIcon icon={timeOutline} size="large" color="secondary" style={{marginBottom: '8px'}} />
                  <div style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--ion-text-color)'}}>{cls.duration_minutes} min</div>
                  <div style={{fontSize: '0.875rem', color: 'var(--ion-color-medium)'}}>Duración</div>
                </IonCol>
              </IonRow>
              {cls.capacity && (
                <IonRow>
                  <IonCol size="12" className="ion-padding-top">
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                      <IonIcon icon={peopleOutline} size="large" color="tertiary" style={{flexShrink: 0}} />
                      <div style={{flex: 1}}>
                        <div style={{fontSize: '1rem', fontWeight: 600}}>Asistentes: {cls.attendees_count} / {cls.capacity}</div>
                        <IonProgressBar value={capacityPercent / 100} color="primary" style={{height: '6px', borderRadius: '3px'}} />
                      </div>
                    </div>
                  </IonCol>
                </IonRow>
              )}
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {cls.description && (
          <IonCard className="ion-margin-bottom card-soft" style={{boxShadow: 'none'}}>
            <IonCardContent className="ion-padding">
              <h3 style={{margin: '0 0 12px', fontFamily: 'var(--ion-font-serif)', fontSize: '1.1rem', fontWeight: 600}}>
                <IonIcon icon={videocamOutline} color="primary" slot="start" style={{marginRight: '8px'}} /> Sobre la clase
              </h3>
              <p style={{margin: 0, lineHeight: 1.7, color: 'var(--ion-text-color)'}}>{cls.description}</p>
            </IonCardContent>
          </IonCard>
        )}

        {cls.attended ? (
          <IonText color="success" className="ion-text-center ion-margin-bottom ion-padding" style={{background: 'var(--color-salvia-50)', borderRadius: '16px', border: '1px solid var(--color-salvia-200)'}}>
            <IonIcon icon={checkmarkCircleOutline} size="large" style={{marginRight: '8px'}} /> ¡Asistencia registrada! Som Namasté.
          </IonText>
        ) : (
          <IonButton
            expand="block"
            iconStart={true}
            icon={personAddOutline}
            onClick={handleAttend}
            disabled={attending}
            className="ion-margin-bottom btn-primary"
            style={{padding: '20px 32px', fontSize: '1.1rem'}}
          >
            {attending ? 'Registrando…' : 'Asistir a esta clase'}
          </IonButton>
        )}

        <IonNote className="ion-text-center ion-padding">
          Tu asistencia suma minutos y desbloquea logros.
        </IonNote>
      </IonContent>
    </IonPage>
  );
}