import { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonThumbnail,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonNote,
} from '@ionic/react';
import { arrowForwardOutline, timeOutline, schoolOutline, peopleOutline, calendarOutline, checkmarkCircleOutline, videocamOutline } from 'ionicons/icons';
import * as api from '../lib/api';

const levelLabels = {
  todos: 'Todos los niveles',
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const fmt = (iso) => new Date(iso).toLocaleString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function getStatus(cls) {
  const now = new Date();
  const start = new Date(cls.scheduled_start);
  const end = new Date(start.getTime() + cls.duration_minutes * 60000);
  if (now < start) return { label: 'Próxima', color: 'primary', icon: calendarOutline };
  if (now >= start && now <= end) return { label: 'En vivo', color: 'danger', icon: videocamOutline };
  return { label: 'Finalizada', color: 'medium', icon: checkmarkCircleOutline };
}

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

function LevelBadge({ level, fallback }) {
  const label = levelLabels[level] || fallback || (levelLabels.todos);
  return <span className={`badge ${levelBadge[level] || 'badge-arena'}`}>{label}</span>;
}

export function ClassesPage() {
  const [segment, setSegment] = useState('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [recorded, setRecorded] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [up, pa, rec] = await Promise.all([
        api.listLiveClasses(false),
        api.listLiveClasses(true),
        api.listRecordedClasses(),
      ]);
      setUpcoming(up.results || []);
      setPast(pa.results || []);
      setRecorded(rec.results || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const doRefresh = async (ev) => { await load(); ev.target.complete(); };

  const list = segment === 'upcoming' ? upcoming : segment === 'past' ? past : recorded;

  return (
    <IonPage>
      <IonHeader style={{ background: 'transparent' }}>
        <IonToolbar color="light">
          <IonTitle>Clases</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-margin-bottom">
          <p className="section-subtitle">Clases</p>
          <h2 className="section-title">Encontrá tu práctica ideal</h2>
          <p className="section-desc">Clases en vivo, grabadas y pasadas. Filtrá por estado y explorá los detalles.</p>
        </div>

        <IonSegment value={segment} onIonChange={e => setSegment(e.detail.value)} className="ion-margin-bottom">
          <IonSegmentButton value="upcoming"><IonLabel>Próximas</IonLabel></IonSegmentButton>
          <IonSegmentButton value="past"><IonLabel>Pasadas</IonLabel></IonSegmentButton>
          <IonSegmentButton value="recorded"><IonLabel>Grabadas</IonLabel></IonSegmentButton>
        </IonSegment>

        {loading ? (
          <div className="ion-text-center ion-padding"><IonSpinner name="crescent" /></div>
        ) : list.length === 0 ? (
          <div className="ion-text-center ion-padding" style={{padding: '48px 16px'}}>
            <span className="icon-circle icon-circle-lg" style={{background: 'var(--color-arena-200)', color: 'var(--color-tinta-500)', margin: '0 auto 16px'}}>
              <IonIcon icon={peopleOutline} size="large" />
            </span>
            <h3 style={{margin: '0 0 8px', fontFamily: 'var(--ion-font-serif)', fontWeight: 600, color: 'var(--ion-text-color)'}}>No hay clases en esta sección</h3>
            <p style={{margin: 0, color: 'var(--ion-color-medium)'}}>
              {segment === 'upcoming' ? 'Las próximas clases en vivo aparecerán aquí' :
               segment === 'past' ? 'Las clases finalizadas se guardan aquí' :
               'Las clases grabadas estarán disponibles pronto'}
            </p>
          </div>
        ) : (
          <IonList lines="none">
            {list.map(c => {
              const status = segment !== 'recorded' ? getStatus(c) : null;
              const levelLabel = levelLabels[c.level] || c.level_display;
              return (
                <IonItem
                  key={c.id}
                  button
                  routerLink={`/classes/${c.id}`}
                  routerDirection="forward"
                  className="ion-margin-horizontal card-elevated class-row"
                  style={{borderRadius: '20px', marginBottom: '14px', '--background': 'var(--ion-item-background)', padding: '6px'}}
                >
                  <IonThumbnail slot="start" className="class-thumb">
                    {c.thumbnail_url ? (
                      <img src={c.thumbnail_url} alt="" loading="lazy" />
                    ) : (
                      <span className="icon-circle" style={{background: 'var(--color-salvia-100)', color: 'var(--color-salvia-600)'}}>
                        <IonIcon icon={schoolOutline} size="large" />
                      </span>
                    )}
                  </IonThumbnail>
                  <IonLabel>
                    <h3 className="class-title">{c.title}</h3>
                    <div className="class-meta">
                      {status && <span className={`badge ${statusBadge[status.label] || statusBadge.Finalizada}`}>
                        <IonIcon icon={status.icon} size="small" style={{marginRight: '4px', verticalAlign: '-2px'}} /> {status.label}
                      </span>}
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><IonIcon icon={calendarOutline} size="small" /> {fmt(c.scheduled_start)}</span>
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><IonIcon icon={timeOutline} size="small" /> {c.duration_minutes} min</span>
                    </div>
                    <div className="class-footer">
                      <LevelBadge level={c.level} fallback={levelLabel} />
                      {c.description && <p className="class-desc">{c.description}</p>}
                    </div>
                  </IonLabel>
                  <span slot="end" className="class-arrow"><IonIcon icon={arrowForwardOutline} /></span>
                </IonItem>
              );
            })}
          </IonList>
        )}

        <IonNote className="ion-text-center ion-padding">
          Las clases en vivo se transmiten por YouTube. Las grabadas están disponibles bajo demanda.
        </IonNote>
      </IonContent>
    </IonPage>
  );
}