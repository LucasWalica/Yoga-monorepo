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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonList,
  IonAvatar,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
} from '@ionic/react';
import { alertController } from '@ionic/core';
import {
  arrowBackOutline,
  logOutOutline,
  keyOutline,
  addCircleOutline,
  trashOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useAuth } from '@context/AuthContext.jsx';
import * as api from '@lib/api';
import { registerPasskey } from '@lib/passkeys';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, logout, reload } = useAuth();
  const navigate = useNavigate();
  const [passkeys, setPasskeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regDevice, setRegDevice] = useState('');
  const [regChallenge, setRegChallenge] = useState('');
  const [regOptions, setRegOptions] = useState(null);
  const [reqType, setReqType] = useState('');
  const [reqTime, setReqTime] = useState('');
  const [reqMsg, setReqMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertCtrl] = useState(() => alertController);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const p = await api.listPasskeys();
      setPasskeys(p);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToastMsg(msg); setToastOpen(true); };

  const startPasskeyReg = async () => {
    try {
      const res = await api.passkeyRegisterStart();
      setRegChallenge(res.challenge_token);
      setRegOptions(res.options);
    } catch (e) { showToast(e.data?.detail || 'Error iniciando registro'); }
  };

  const verifyPasskeyReg = async () => {
    if (!regDevice.trim()) { showToast('Pon un nombre al dispositivo'); return; }
    try {
      const credential = await registerPasskey(regChallenge, regOptions, regDevice.trim());
      await api.passkeyRegisterVerify(regChallenge, credential.response, regDevice.trim());
      await load();
      setRegDevice(''); setRegChallenge(''); setRegOptions(null);
      showToast('Passkey registrada correctamente');
    } catch (e) { showToast(e.message || 'Error registrando passkey'); }
  };

  const deletePasskey = async (id) => {
    const alert = await alertCtrl.create({
      header: 'Eliminar passkey',
      message: '¿Seguro que quieres eliminar esta passkey?',
      buttons: ['Cancelar', { text: 'Eliminar', role: 'destructive', handler: () => api.deletePasskey(id).then(load) }]
    });
    alert.present();
  };

  const createRequest = async () => {
    if (!reqType.trim() || !reqMsg.trim()) { showToast('Completa tipo y mensaje'); return; }
    setSubmitting(true);
    try {
      await api.createClassRequest({ class_type: reqType, preferred_time: reqTime, message: reqMsg });
      setReqType(''); setReqTime(''); setReqMsg('');
      showToast('Solicitud enviada correctamente');
    } catch (e) { showToast(e.data?.detail || 'Error enviando solicitud'); }
    finally { setSubmitting(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SY';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => navigate('/home')}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={async e => { await reload(); await load(); e.target.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <IonCard className="ion-margin-bottom" style={{borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'}}>
          <div className="profile-banner" />
          <div className="ion-padding" style={{paddingTop: '8px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '-44px'}}>
              <div style={{width: '88px', height: '88px', borderRadius: '50%', border: '4px solid var(--ion-item-background)', background: 'linear-gradient(135deg, var(--color-salvia-500) 0%, var(--color-salvia-700) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ion-font-serif)', fontSize: '2rem', fontWeight: 600, boxShadow: 'var(--shadow-lg)', marginBottom: '12px'}}>
                {initials}
              </div>
              <h2 style={{margin: '0 0 4px', fontFamily: 'var(--ion-font-serif)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--ion-text-color)'}}>{user?.full_name || 'Alumno'}</h2>
              <p style={{margin: 0, color: 'var(--ion-color-medium)'}}>{user?.email}</p>
            </div>

            <IonGrid className="ion-margin-top">
              <IonRow>
                <IonCol size="6" className="ion-text-center ion-padding-vertical">
                  <div style={{fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-text-color)'}}>{user?.profile?.streak_days ?? 0}</div>
                  <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Racha actual</div>
                </IonCol>
                <IonCol size="6" className="ion-text-center ion-padding-vertical" style={{borderLeft: '1px solid var(--ion-border-color)'}}>
                  <div style={{fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-text-color)'}}>{user?.profile?.total_minutes ?? 0}</div>
                  <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Minutos totales</div>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6" className="ion-text-center ion-padding-vertical" style={{borderTop: '1px solid var(--ion-border-color)'}}>
                  <div style={{fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-text-color)'}}>{user?.profile?.classes_attended ?? 0}</div>
                  <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Clases</div>
                </IonCol>
                <IonCol size="6" className="ion-text-center ion-padding-vertical" style={{borderTop: '1px solid var(--ion-border-color)', borderLeft: '1px solid var(--ion-border-color)'}}>
                  <div style={{fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--ion-font-serif)', color: 'var(--ion-text-color)'}}>{user?.profile?.longest_streak ?? 0}</div>
                  <div style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ion-color-medium)'}}>Mejor racha</div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </IonCard>

        <IonText color="medium"><h3 className="ion-padding-start section-subtitle">Passkeys</h3></IonText>
        <IonCard className="ion-margin-bottom card-elevated" style={{borderRadius: '20px'}}>
          <IonList lines="full">
            {loading ? (
              <IonItem><IonSpinner slot="start" name="crescent" />Cargando…</IonItem>
            ) : passkeys.length === 0 ? (
              <IonItem lines="none" className="ion-padding ion-text-center">
                <IonIcon icon={keyOutline} size="large" color="medium" style={{marginBottom: '8px'}} />
                <p style={{margin: '0 0 8px', color: 'var(--ion-text-color)'}}>No hay passkeys registradas</p>
                <p style={{margin: 0, fontSize: '0.875rem', color: 'var(--ion-color-medium)'}}>Registra una para entrar sin contraseña</p>
              </IonItem>
            ) : (
              passkeys.map(p => (
                <IonItem key={p.id} lines="full" className="ion-margin-horizontal" style={{borderRadius: '16px', marginBottom: '12px'}}>
                  <IonAvatar slot="start" style={{background: 'var(--ion-color-primary)'}}>
                    <IonIcon icon={shieldCheckmarkOutline} color="primary" />
                  </IonAvatar>
                  <IonLabel>
                    <h3 style={{margin: 0, fontWeight: 600}}>{p.device_name || 'Dispositivo'}</h3>
                    <p style={{margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--ion-color-medium)'}}>
                      Registrada: {new Date(p.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </IonLabel>
                  <IonButton fill="clear" color="danger" iconOnly slot="end" onClick={() => deletePasskey(p.id)}>
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonItem>
              ))
            )}
            <IonItem lines="none" className="ion-padding">
              <IonButton fill="outline" iconStart={true} icon={addCircleOutline} onClick={startPasskeyReg} expand="block" className="ion-margin-top">
                Registrar passkey
              </IonButton>
            </IonItem>
          </IonList>
        </IonCard>

        {regOptions && (
          <IonCard className="ion-margin-bottom card-elevated" style={{borderRadius: '20px', background: 'var(--color-terracota-50)', border: '1px solid var(--color-terracota-200)'}}>
            <IonCardHeader>
              <IonCardTitle>Registrar nueva passkey</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="floating">Nombre del dispositivo</IonLabel>
                <IonInput value={regDevice} onIonChange={e => setRegDevice(e.detail.value || '')} placeholder="Mi iPhone" />
              </IonItem>
              <IonButton expand="block" onClick={verifyPasskeyReg} disabled={!regDevice.trim()} className="ion-margin-top btn-primary">
                Confirmar registro
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        <IonText color="medium"><h3 className="ion-padding-start ion-margin-top section-subtitle">Solicitar clase</h3></IonText>
        <IonCard className="ion-margin-bottom card-elevated" style={{borderRadius: '20px'}}>
          <IonList lines="none" className="ion-padding">
            <IonItem lines="none">
              <IonLabel position="floating">Tipo de clase</IonLabel>
              <IonInput value={reqType} onIonChange={e => setReqType(e.detail.value || '')} placeholder="Vinyasa, Yin, Hatha…" />
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="floating">Horario preferido</IonLabel>
              <IonInput value={reqTime} onIonChange={e => setReqTime(e.detail.value || '')} placeholder="Martes 19hs" />
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="floating">Mensaje</IonLabel>
              <IonTextarea value={reqMsg} onIonChange={e => setReqMsg(e.detail.value || '')} placeholder="Qué te gustaría practicar…" rows={3} />
            </IonItem>
            <IonButton expand="block" onClick={createRequest} disabled={submitting} className="ion-margin-top btn-primary">
              {submitting ? 'Enviando…' : 'Enviar solicitud'}
            </IonButton>
          </IonList>
        </IonCard>

        <IonButton expand="block" fill="outline" color="danger" iconStart={true} icon={logOutOutline} onClick={handleLogout} className="ion-margin-top" style={{borderRadius: '12px'}}>
          Cerrar sesión
        </IonButton>

        <IonToast isOpen={toastOpen} onDidDismiss={() => setToastOpen(false)} message={toastMsg} duration={3000} position="bottom" />
      </IonContent>
    </IonPage>
  );
}