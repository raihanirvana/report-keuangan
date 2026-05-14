type CategoryIconPreset = {
  icon: string;
  label: string;
};

type CategoryCreateContentProps = {
  color: string;
  icon: string;
  isBusy?: boolean;
  name: string;
  onChangeColor: (value: string) => void;
  onChangeIcon: (value: string) => void;
  onChangeName: (value: string) => void;
  onSave?: () => void;
  saveLabel?: string;
};

export type {
  CategoryCreateContentProps,
  CategoryIconPreset,
};
