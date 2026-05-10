import {
  type Dispatch,
  type SetStateAction,
  useState,
} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { setAuthToken } from '../../Utils/authStorage';

import styles from './LoginScreen.styles';

const DUMMY_EMAIL = 'test@mail.com';
const DUMMY_PASSWORD = 'password';

type AuthMode = 'login' | 'signup';

type LoginFieldProps = {
  icon: 'email' | 'lock' | 'user';
  isSecure?: boolean;
  label: string;
  onChangeText: (value: string) => void;
  onToggleSecure?: () => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
};

type LoginScreenProps = {
  onLogin?: () => void;
};

type LoginFormStateParams = {
  email: string;
  errorMessage: string;
  handleLogin: () => void;
  isLoading: boolean;
  isPasswordVisible: boolean;
  mode: AuthMode;
  name: string;
  password: string;
  setEmail: (value: string) => void;
  setIsPasswordVisible: Dispatch<SetStateAction<boolean>>;
  setName: (value: string) => void;
  setPassword: (value: string) => void;
  toggleMode: () => void;
};

function EmailIcon() {
  return (
    <View style={styles.emailIcon}>
      <View style={styles.emailIconFlapLeft} />
      <View style={styles.emailIconFlapRight} />
    </View>
  );
}

function LockIcon() {
  return (
    <View style={styles.lockIcon}>
      <View style={styles.lockShackle} />
      <View style={styles.lockBody}>
        <View style={styles.lockKeyhole} />
      </View>
    </View>
  );
}

function UserIcon() {
  return (
    <View style={styles.userIcon}>
      <View style={styles.userHead} />
      <View style={styles.userBody} />
    </View>
  );
}

function EyeIcon() {
  return (
    <View style={styles.eyeIconContainer}>
      <View style={styles.eyeArcTop} />
      <View style={styles.eyeArcBottom} />
      <View style={styles.eyePupil} />
    </View>
  );
}

function FieldIcon({ name }: { name: LoginFieldProps['icon'] }) {
  if (name === 'user') {
    return <UserIcon />;
  }

  return name === 'email' ? <EmailIcon /> : <LockIcon />;
}

function SecureToggle(props: {
  isVisible?: boolean;
  onToggle?: () => void;
}) {
  if (!props.isVisible) {
    return null;
  }

  return (
    <Pressable onPress={props.onToggle} style={styles.eyeButton}>
      <EyeIcon />
    </Pressable>
  );
}

function LoginLogo() {
  return (
    <View style={styles.logo}>
      <Text style={styles.logoIcon}>♧</Text>
      <View style={styles.logoBadge}>
        <Text style={styles.logoBadgeIcon}>▭</Text>
      </View>
    </View>
  );
}

function LoginHeader({ mode }: { mode: AuthMode }) {
  const isSignup = mode === 'signup';

  return (
    <View style={styles.header}>
      <LoginLogo />
      <Text style={styles.title}>
        {isSignup ? 'Daftar Dulu, Kak! ✨' : 'Halo, Sahabat Cuan! ✨'}
      </Text>
      <Text style={styles.subtitle}>
        {isSignup
          ? 'Bikin akun simpel, langsung bisa atur uangmu.'
          : 'Masuk dulu yuk buat cek tabungan lucumu.'}
      </Text>
    </View>
  );
}

function LoginField(props: LoginFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{props.label}</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <FieldIcon name={props.icon} />
        </View>
        <TextInput
          autoCapitalize="none"
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={props.secureTextEntry}
          style={styles.input}
          value={props.value}
        />
        <SecureToggle
          isVisible={props.isSecure}
          onToggle={props.onToggleSecure}
        />
      </View>
    </View>
  );
}

function getSignupNameError(mode: AuthMode, name: string) {
  if (mode === 'signup' && name.trim().length < 2) {
    return 'Nama minimal 2 karakter.';
  }

  return '';
}

function getCredentialError(mode: AuthMode, email: string, password: string) {
  if (!email.includes('@')) {
    return 'Email belum valid.';
  }

  if (password.length < 6) {
    return 'Kata sandi minimal 6 karakter.';
  }

  if (
    mode === 'login'
    && (email !== DUMMY_EMAIL || password !== DUMMY_PASSWORD)
  ) {
    return 'Email atau kata sandi belum cocok.';
  }

  return '';
}

function getLoginError(
  mode: AuthMode,
  name: string,
  email: string,
  password: string,
) {
  const nameError = getSignupNameError(mode, name);

  return nameError || getCredentialError(mode, email, password);
}

function LoginButton(props: {
  isDisabled: boolean;
  isLoading: boolean;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      disabled={props.isDisabled}
      onPress={props.onPress}
      style={[styles.loginButton, props.isDisabled && styles.loginButtonDisabled]}
    >
      {props.isLoading ? (
        <ActivityIndicator color="#0F172A" />
      ) : (
        <Text style={styles.loginButtonText}>{props.title}</Text>
      )}
    </Pressable>
  );
}

function submitLogin(
  mode: AuthMode,
  name: string,
  email: string,
  password: string,
  onLogin: LoginScreenProps['onLogin'],
  setErrorMessage: (value: string) => void,
  setLoading: (value: boolean) => void,
) {
  const error = getLoginError(mode, name, email.trim(), password);

  setErrorMessage(error);

  if (error) {
    return;
  }

  setLoading(true);
  setTimeout(async () => {
    await setAuthToken();
    setLoading(false);
    onLogin?.();
  }, 600);
}

function getAuthModeCopy(mode: AuthMode) {
  return {
    authActionText: mode === 'login' ? 'Daftar' : 'Masuk',
    authQuestion: mode === 'login'
      ? 'Belum punya akun?'
      : 'Sudah punya akun?',
    buttonTitle: mode === 'login' ? 'Masuk' : 'Daftar',
  };
}

function getSubmitDisabled(params: LoginFormStateParams) {
  return !params.email
    || !params.password
    || (params.mode === 'signup' && !params.name)
    || params.isLoading;
}

function getLoginFormState(params: LoginFormStateParams) {
  return {
    ...getAuthModeCopy(params.mode),
    email: params.email,
    errorMessage: params.errorMessage,
    handleLogin: params.handleLogin,
    isLoading: params.isLoading,
    isPasswordVisible: params.isPasswordVisible,
    isSignup: params.mode === 'signup',
    isSubmitDisabled: getSubmitDisabled(params),
    name: params.name,
    mode: params.mode,
    password: params.password,
    setEmail: params.setEmail,
    setIsPasswordVisible: params.setIsPasswordVisible,
    setName: params.setName,
    setPassword: params.setPassword,
    toggleMode: params.toggleMode,
  };
}

function useAuthFields() {
  const [email, setEmail] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  return {
    email,
    isPasswordVisible,
    name,
    password,
    setEmail,
    setIsPasswordVisible,
    setName,
    setPassword,
  };
}

function createLoginHandler(
  mode: AuthMode,
  fields: ReturnType<typeof useAuthFields>,
  onLogin: LoginScreenProps['onLogin'],
  setErrorMessage: (value: string) => void,
  setLoading: (value: boolean) => void,
) {
  return () => submitLogin(
    mode,
    fields.name,
    fields.email,
    fields.password,
    onLogin,
    setErrorMessage,
    setLoading,
  );
}

function createModeToggle(
  setMode: Dispatch<SetStateAction<AuthMode>>,
  setErrorMessage: (value: string) => void,
) {
  return () => {
    setErrorMessage('');
    setMode(value => (value === 'login' ? 'signup' : 'login'));
  };
}

function useLoginForm({ onLogin }: LoginScreenProps) {
  const fields = useAuthFields();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const handleLogin = createLoginHandler(
    mode, fields, onLogin, setErrorMessage, setLoading,
  );
  const toggleMode = createModeToggle(setMode, setErrorMessage);

  return getLoginFormState({
    ...fields,
    errorMessage,
    handleLogin,
    isLoading,
    mode,
    toggleMode,
  });
}

function SignupNameField(props: ReturnType<typeof useLoginForm>) {
  if (!props.isSignup) {
    return null;
  }

  return (
    <LoginField
      icon="user"
      label="Nama Kamu"
      onChangeText={props.setName}
      placeholder="Caca Cute"
      value={props.name}
    />
  );
}

function LoginFields(props: ReturnType<typeof useLoginForm>) {
  return (
    <>
      <SignupNameField {...props} />
      <LoginField
        icon="email"
        label="Email Kamu"
        onChangeText={props.setEmail}
        placeholder="test@mail.com"
        value={props.email}
      />
      <LoginField
        icon="lock"
        isSecure
        label="Kata Sandi"
        onChangeText={props.setPassword}
        onToggleSecure={() => props.setIsPasswordVisible(value => !value)}
        placeholder="password"
        secureTextEntry={!props.isPasswordVisible}
        value={props.password}
      />
    </>
  );
}

function ForgotPasswordLink({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Pressable style={styles.forgotButton}>
      <Text style={styles.forgotText}>Lupa kata sandi?</Text>
    </Pressable>
  );
}

function SwitchModeLink(props: ReturnType<typeof useLoginForm>) {
  return (
    <Pressable onPress={props.toggleMode} style={styles.switchModeButton}>
      <Text style={styles.switchModeText}>
        {props.authQuestion}{' '}
        <Text style={styles.switchModeAction}>{props.authActionText}</Text>
      </Text>
    </Pressable>
  );
}

function LoginForm(props: LoginScreenProps) {
  const form = useLoginForm(props);

  return (
    <>
      <LoginHeader mode={form.mode} />
      <LoginFields {...form} />
      {!!form.errorMessage && (
        <Text style={styles.errorText}>{form.errorMessage}</Text>
      )}
      <ForgotPasswordLink isVisible={!form.isSignup} />
      <LoginButton
        isDisabled={form.isSubmitDisabled}
        isLoading={form.isLoading}
        onPress={form.handleLogin}
        title={form.buttonTitle}
      />
      <SwitchModeLink {...form} />
    </>
  );
}

function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <LoginForm onLogin={onLogin} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
