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

type LoginFieldProps = {
  icon: 'email' | 'lock';
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
  password: string;
  setEmail: (value: string) => void;
  setIsPasswordVisible: Dispatch<SetStateAction<boolean>>;
  setPassword: (value: string) => void;
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

function LoginHeader() {
  return (
    <View style={styles.header}>
      <LoginLogo />
      <Text style={styles.title}>Halo, Sahabat Cuan! ✨</Text>
      <Text style={styles.subtitle}>
        Masuk dulu yuk buat cek tabungan lucumu.
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

function getLoginError(email: string, password: string) {
  if (!email.includes('@')) {
    return 'Email belum valid.';
  }

  if (password.length < 6) {
    return 'Kata sandi minimal 6 karakter.';
  }

  if (email !== DUMMY_EMAIL || password !== DUMMY_PASSWORD) {
    return 'Email atau kata sandi belum cocok.';
  }

  return '';
}

function LoginButton(props: {
  isDisabled: boolean;
  isLoading: boolean;
  onPress: () => void;
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
        <Text style={styles.loginButtonText}>Masuk</Text>
      )}
    </Pressable>
  );
}

function submitLogin(
  email: string,
  password: string,
  onLogin: LoginScreenProps['onLogin'],
  setErrorMessage: (value: string) => void,
  setLoading: (value: boolean) => void,
) {
  const error = getLoginError(email.trim(), password);

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

function getLoginFormState(params: LoginFormStateParams) {
  return {
    email: params.email,
    errorMessage: params.errorMessage,
    handleLogin: params.handleLogin,
    isLoading: params.isLoading,
    isPasswordVisible: params.isPasswordVisible,
    isSubmitDisabled: !params.email || !params.password || params.isLoading,
    password: params.password,
    setEmail: params.setEmail,
    setIsPasswordVisible: params.setIsPasswordVisible,
    setPassword: params.setPassword,
  };
}

function useLoginForm({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => submitLogin(email, password, onLogin, setErrorMessage, setLoading);

  return getLoginFormState({
    email,
    errorMessage,
    handleLogin,
    isLoading,
    isPasswordVisible,
    password,
    setEmail,
    setIsPasswordVisible,
    setPassword,
  });
}

function LoginFields(props: ReturnType<typeof useLoginForm>) {
  return (
    <>
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

function LoginForm(props: LoginScreenProps) {
  const form = useLoginForm(props);

  return (
    <>
      <LoginFields {...form} />
      {!!form.errorMessage && (
        <Text style={styles.errorText}>{form.errorMessage}</Text>
      )}
      <Pressable style={styles.forgotButton}>
        <Text style={styles.forgotText}>Lupa kata sandi?</Text>
      </Pressable>
      <LoginButton
        isDisabled={form.isSubmitDisabled}
        isLoading={form.isLoading}
        onPress={form.handleLogin}
      />
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
          <LoginHeader />
          <LoginForm onLogin={onLogin} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
