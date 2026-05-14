import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  categoryIconPresets,
  getCategoryIconValue,
} from '../../Utils/categoryIcons';

import styles from './CategoryCreateContent.styles';
import type {
  CategoryCreateContentProps,
  CategoryIconPreset,
} from './CategoryCreateContent.types';

const categoryColorPresets = [
  '#EE2B6C',
  '#4EA8DE',
  '#A29BFE',
  '#FBCF33',
  '#22C55E',
  '#FB7185',
] as const;

function CategoryCreateContent(props: CategoryCreateContentProps) {
  return (
    <View style={styles.form}>
      <CategoryNameField {...props} />
      <CategoryColorPicker {...props} />
      <CategoryIconPicker {...props} />
      <CategorySaveButton {...props} />
    </View>
  );
}

function CategoryNameField(props: CategoryCreateContentProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Nama Kategori</Text>
      <TextInput
        onChangeText={props.onChangeName}
        placeholder="Contoh: Transport Malam"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={props.name}
      />
    </View>
  );
}

function CategoryColorPicker(props: CategoryCreateContentProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Warna Kategori</Text>
      <View style={styles.colorRow}>
        {categoryColorPresets.map(color => (
          <CategoryColorSwatch
            color={color}
            isActive={props.color === color}
            key={color}
            onPress={props.onChangeColor}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryColorSwatch(props: {
  color: string;
  isActive: boolean;
  onPress: (color: string) => void;
}) {
  return (
    <Pressable
      onPress={() => props.onPress(props.color)}
      style={[styles.colorSwatch, props.isActive && styles.colorSwatchActive]}
    >
      <View style={[styles.colorSwatchInner, { backgroundColor: props.color }]} />
      <CategoryColorSwatchCheck isActive={props.isActive} />
    </Pressable>
  );
}

function CategoryColorSwatchCheck(props: { isActive: boolean }) {
  if (!props.isActive) {
    return null;
  }

  return (
    <View style={styles.colorSwatchCheckBadge}>
      <Text style={styles.colorSwatchCheck}>✓</Text>
    </View>
  );
}

function CategoryIconPicker(props: CategoryCreateContentProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Ikon Kategori</Text>
      <View style={styles.iconGrid}>
        {categoryIconPresets.map(preset => (
          <CategoryIconOption
            isActive={props.icon === preset.icon}
            key={preset.icon}
            onPress={props.onChangeIcon}
            preset={preset}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryIconOption(props: {
  isActive: boolean;
  onPress: (icon: string) => void;
  preset: CategoryIconPreset;
}) {
  return (
    <Pressable
      onPress={() => props.onPress(props.preset.icon)}
      style={[styles.iconOption, props.isActive && styles.iconOptionActive]}
    >
      <Text style={styles.iconSymbol}>{getCategoryIconValue(props.preset.icon)}</Text>
    </Pressable>
  );
}

function CategorySaveButton(props: CategoryCreateContentProps) {
  if (!props.onSave) {
    return null;
  }

  return (
    <Pressable
      disabled={props.isBusy}
      onPress={props.onSave}
      style={[styles.saveButton, props.isBusy && styles.saveButtonDisabled]}
    >
      <Text style={styles.saveButtonText}>
        {props.saveLabel ?? 'Simpan Kategori'}
      </Text>
    </Pressable>
  );
}

export {
  categoryColorPresets,
  categoryIconPresets,
};

export default CategoryCreateContent;
