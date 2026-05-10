import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../Components/BottomSheet';

import styles from './AddTransactionSheet.styles';

const categories = [
  { icon: '▮▮', label: 'Food' },
  { icon: '⌘', label: 'Transport' },
  { icon: '▢', label: 'Shopping' },
  { icon: '☆', label: 'Fun' },
] as const;
const transactionTypes = ['Pengeluaran', 'Pemasukan', 'Pindah Dana'] as const;
type TransactionType = (typeof transactionTypes)[number];

function SheetHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
}) {
  return (
    <>
      <View style={styles.dragHandleArea} {...props.dragHandleProps}>
        <View style={styles.handle} />
      </View>
      <View style={styles.header}>
        <View style={styles.headerTitleArea} {...props.dragHandleProps}>
          <Text style={styles.title}>Add Transaction</Text>
        </View>
        <Pressable onPress={props.onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>
    </>
  );
}

function TypeSegment(props: {
  activeType: TransactionType;
  onChangeType: (type: TransactionType) => void;
}) {
  return (
    <View style={styles.segment}>
      {transactionTypes.map(type => {
        const isActive = props.activeType === type;

        return (
          <Pressable
            key={type}
            onPress={() => props.onChangeType(type)}
            style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {type}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AmountInput() {
  return (
    <View style={styles.amountBox}>
      <Text style={styles.amountLabel}>Total Amount</Text>
      <View style={styles.amountRow}>
        <Text style={styles.inputPrefix}>Rp</Text>
        <TextInput
          defaultValue="250.000"
          keyboardType="number-pad"
          placeholder="0"
          style={styles.amountInput}
        />
      </View>
    </View>
  );
}

function TransactionFields(props: { walletLabel: string }) {
  return (
    <View style={styles.fieldsRow}>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Date</Text>
        <View style={styles.fieldBox}>
          <Text style={styles.fieldIcon}>□</Text>
          <Text style={styles.fieldText}>Today, 24 Oct</Text>
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{props.walletLabel}</Text>
        <View style={styles.fieldBox}>
          <Text style={styles.fieldIcon}>▣</Text>
          <Text numberOfLines={1} style={styles.fieldText}>Main Bank</Text>
          <Text style={styles.fieldIcon}>⌄</Text>
        </View>
      </View>
    </View>
  );
}

function CategoryIcon(props: {
  isActive: boolean;
  value: string;
}) {
  return (
    <View
      style={[
        styles.categoryCircle,
        props.isActive && styles.categoryCircleActive,
      ]}
    >
      <Text
        style={[styles.categoryIcon, props.isActive && styles.categoryIconActive]}
      >
        {props.value}
      </Text>
    </View>
  );
}

function CategoryItem(props: {
  icon: string;
  isActive: boolean;
  label: string;
}) {
  return (
    <Pressable style={styles.categoryItem}>
      <CategoryIcon isActive={props.isActive} value={props.icon} />
      <Text
        style={[styles.categoryLabel, props.isActive && styles.categoryLabelActive]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

function CategoryPicker() {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Category</Text>
        <Text style={styles.sectionLink}>See All</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          {categories.map((category, index) => (
            <CategoryItem
              icon={category.icon}
              isActive={index === 0}
              key={category.label}
              label={category.label}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function TransferDestination() {
  return (
    <View style={styles.transferSection}>
      <Text style={styles.sectionTitle}>Transfer Destination</Text>
      <View style={styles.transferBox}>
        <TransferWallet icon="▣" label="Main Bank" variant="from" />
        <View style={styles.transferArrow}>
          <Text style={styles.transferArrowText}>→</Text>
        </View>
        <TransferWallet icon="♟" label="Savings  ⌄" variant="to" />
      </View>
    </View>
  );
}

function TransferWallet(props: {
  icon: string;
  label: string;
  variant: 'from' | 'to';
}) {
  const isTarget = props.variant === 'to';

  return (
    <View style={styles.transferWallet}>
      <View style={[styles.transferWalletIcon, isTarget && styles.transferTarget]}>
        <Text style={styles.transferWalletIconText}>{props.icon}</Text>
      </View>
      <Text style={[styles.transferWalletLabel, isTarget && styles.transferTargetLabel]}>
        {props.label}
      </Text>
    </View>
  );
}

function NotesField(props: { placeholder: string }) {
  return (
    <View style={styles.notesSection}>
      <Text style={styles.sectionTitle}>Notes (Optional)</Text>
      <TextInput
        multiline
        placeholder={props.placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.noteInput}
      />
    </View>
  );
}

function SheetBody() {
  const [activeType, setActiveType] = useState<TransactionType>('Pengeluaran');
  const isTransfer = activeType === 'Pindah Dana';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TypeSegment activeType={activeType} onChangeType={setActiveType} />
      <AmountInput />
      <TransactionFields walletLabel={isTransfer ? 'From Wallet' : 'Wallet'} />
      {isTransfer ? <TransferDestination /> : <CategoryPicker />}
      <NotesField
        placeholder={
          isTransfer
            ? 'What is this transfer for? e.g., Monthly saving...'
            : 'What did you buy? e.g., Sushi date...'
        }
      />
    </ScrollView>
  );
}

function SheetFooter() {
  return (
    <View style={styles.footer}>
      <Pressable style={styles.saveButton}>
        <Text style={styles.saveText}>Simpan  ✓</Text>
      </Pressable>
    </View>
  );
}

function AddTransactionSheet(props: { onClose: () => void; visible: boolean }) {
  return (
    <BottomSheet
      containerStyle={styles.container}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <>
          <SheetHeader
            dragHandleProps={dragHandleProps}
            onClose={props.onClose}
          />
          <SheetBody />
          <SheetFooter />
        </>
      )}
    </BottomSheet>
  );
}

export default AddTransactionSheet;
