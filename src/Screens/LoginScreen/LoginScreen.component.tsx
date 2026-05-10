import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import styles from './LoginScreen.styles';

type LoginFieldProps = {
  icon: 'email' | 'lock';
  isSecure?: boolean;
  label: string;
  onToggleSecure?: () => void;
  placeholder: string;
  secureTextEntry?: boolean;
};

type LoginScreenProps = {
  onLogin?: () => void;
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
          placeholder={props.placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={props.secureTextEntry}
          style={styles.input}
        />
        {props.isSecure && (
          <Pressable onPress={props.onToggleSecure} style={styles.eyeButton}>
            <EyeIcon />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function LoginForm({ onLogin }: LoginScreenProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <>
      <LoginField icon="email" label="Email Kamu" placeholder="nama@email.com" />
      <LoginField
        icon="lock"
        isSecure
        label="Kata Sandi"
        onToggleSecure={() => setIsPasswordVisible(value => !value)}
        placeholder="••••••••"
        secureTextEntry={!isPasswordVisible}
      />
      <Pressable style={styles.forgotButton}>
        <Text style={styles.forgotText}>Lupa kata sandi?</Text>
      </Pressable>
      <Pressable onPress={onLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Masuk</Text>
      </Pressable>
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
