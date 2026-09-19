import { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonLabel,
  IonNote,
  IonIcon,
} from '@ionic/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext.jsx';
import { eyeOutline, eyeOffOutline, lockClosedOutline, mailOutline, personOutline } from 'ionicons/icons';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(email.trim().toLowerCase(), fullName.trim(), password);
      navigate('/home', { replace: true });
    } catch (e) {
      setError(e.data?.detail || 'No se pudo crear la cuenta');
    } finally {
      setBusy(false);
    }
  };

  return (
    <IonPage style={{background: 'var(--ion-background-color)'}}>
      <IonContent className="ion-padding" style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{maxWidth: '420px', margin: '0 auto', width: '100%'}}>

          <div className="ion-text-center ion-margin-bottom" style={{marginBottom: '32px'}}>
            <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-terracota-500) 0%, var(--color-terracota-600) 100%)', marginBottom: '20px', boxShadow: '0 10px 30px -10px var(--color-terracota-500)'}}>
              <span style={{fontFamily: 'var(--ion-font-serif)', fontSize: '2rem', fontWeight: 600, color: '#fff'}}>S</span>
            </div>
            <h1 style={{margin: '0 0 8px', fontFamily: 'var(--ion-font-serif)', fontSize: '2.5rem', fontWeight: 600, color: 'var(--ion-text-color)'}}>Seba Yoga</h1>
            <p style={{margin: 0, color: 'var(--ion-color-medium)', fontSize: '1.1rem'}}>Crea tu cuenta</p>
          </div>

          <IonCard className="card-elevated" style={{borderRadius: '24px', border: '1px solid var(--ion-border-color)'}}>
            <IonCardContent className="ion-padding" style={{padding: '32px 24px'}}>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="ion-margin-bottom ion-padding ion-text-center" style={{borderRadius: '12px', background: 'var(--color-terracota-50)', border: '1px solid var(--color-terracota-200)', color: 'var(--color-terracota-700)'}}>
                    <IonText color="danger"><p style={{margin: 0}}>{error}</p></IonText>
                  </div>
                )}

                <IonItem lines="none" className="input-brand ion-margin-bottom" style={{borderRadius: '12px', '--background': 'var(--color-arena-50)', border: '1px solid var(--ion-border-color)', marginBottom: '16px'}}>
                  <IonIcon slot="start" icon={personOutline} color="medium" style={{marginRight: '12px'}} />
                  <IonLabel position="floating" style={{color: 'var(--ion-color-medium)'}}>Nombre completo</IonLabel>
                  <IonInput
                    value={fullName}
                    onIonChange={e => setFullName(e.detail.value || '')}
                    required
                    autocomplete="name"
                    style={{fontSize: '1rem'}}
                  />
                </IonItem>

                <IonItem lines="none" className="input-brand ion-margin-bottom" style={{borderRadius: '12px', '--background': 'var(--color-arena-50)', border: '1px solid var(--ion-border-color)', marginBottom: '16px'}}>
                  <IonIcon slot="start" icon={mailOutline} color="medium" style={{marginRight: '12px'}} />
                  <IonLabel position="floating" style={{color: 'var(--ion-color-medium)'}}>Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={e => setEmail(e.detail.value || '')}
                    required
                    autocomplete="email"
                    style={{fontSize: '1rem'}}
                  />
                </IonItem>

                <IonItem lines="none" className="input-brand ion-margin-bottom" style={{borderRadius: '12px', '--background': 'var(--color-arena-50)', border: '1px solid var(--ion-border-color)', marginBottom: '24px'}}>
                  <IonIcon slot="start" icon={lockClosedOutline} color="medium" style={{marginRight: '12px'}} />
                  <IonLabel position="floating" style={{color: 'var(--ion-color-medium)'}}>Contraseña (mín. 8)</IonLabel>
                  <IonInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onIonChange={e => setPassword(e.detail.value || '')}
                    required
                    autocomplete="new-password"
                    style={{fontSize: '1rem'}}
                  />
                  <IonButton fill="clear" slot="end" onClick={() => setShowPassword(!showPassword)}>
                    <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} color="medium" />
                  </IonButton>
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={busy}
                  className="btn-primary"
                  style={{marginBottom: '24px', padding: '18px 32px', fontSize: '1.1rem'}}
                >
                  {busy ? <span className="btn-spinner" /> : 'Crear cuenta'}
                </IonButton>
              </form>

              <div className="ion-text-center" style={{paddingTop: '16px', borderTop: '1px solid var(--ion-border-color)'}}>
                <IonNote>
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" style={{color: 'var(--ion-color-primary)', fontWeight: 600, textDecoration: 'none'}}>
                    Entrar
                  </Link>
                </IonNote>
              </div>
            </IonCardContent>
          </IonCard>

          <div className="ion-text-center ion-margin-top" style={{color: 'var(--ion-color-medium)', fontSize: '0.875rem'}}>
            <p style={{margin: 0}}>Al registrarte aceptas nuestros términos y política de privacidad</p>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
}