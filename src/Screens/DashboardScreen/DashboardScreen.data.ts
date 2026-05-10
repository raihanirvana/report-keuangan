const categories = [
  { color: '#EE2B6C', label: 'Makanan' },
  { color: '#4EA8DE', label: 'Main/Hobi' },
  { color: '#FBCF33', label: 'Belanja' },
  { color: '#A29BFE', label: 'Lainnya' },
] as const;

const histories = [
  {
    amount: '- Rp 16.000',
    icon: '🍦',
    title: 'Mixue Boba',
    tone: 'expense',
    meta: 'Via BCA • Hari ini, 14:20',
  },
  {
    amount: '+ Rp 500.000',
    icon: '▣',
    title: 'Saldo Bulanan',
    tone: 'income',
    meta: 'Via BCA • Kemarin, 09:10',
  },
  {
    amount: '- Rp 75.000',
    icon: '▤',
    title: 'Belanja Mini',
    tone: 'expense',
    meta: 'Via GoPay • Kemarin, 18:45',
  },
  {
    amount: '- Rp 32.000',
    icon: '⌘',
    title: 'Transport',
    tone: 'expense',
    meta: 'Via Cash • Senin, 08:15',
  },
] as const;

const wallets = [
  {
    amount: 'Rp 5.250k',
    icon: '▥',
    id: 'bca',
    name: 'ATM BCA',
    tone: 'blue',
  },
  {
    amount: 'Rp 1.120k',
    icon: '▦',
    id: 'gopay',
    name: 'GoPay',
    tone: 'primary',
  },
  {
    amount: 'Rp 850k',
    icon: '★',
    id: 'ovo',
    name: 'OVO',
    tone: 'purple',
  },
  {
    amount: 'Rp 1.200k',
    icon: '▤',
    id: 'cash',
    name: 'Cash',
    tone: 'yellow',
  },
] as const;

const fullHistoryGroups = [
  {
    id: 'today',
    title: 'Hari Ini',
    transactions: [
      {
        amount: '-Rp 85.000',
        icon: '▮▮',
        meta: 'Dompet Utama • 12:30',
        title: 'Sushi Yay!',
        tone: 'expense',
      },
      {
        amount: '-Rp 24.000',
        icon: '⌘',
        meta: 'OVO • 08:15',
        title: 'GoRide to Office',
        tone: 'expense',
      },
    ],
  },
  {
    id: 'may-23',
    title: '23 Mei 2024',
    transactions: [
      {
        amount: '+Rp 1.500.000',
        icon: '▣',
        meta: 'BCA • 10:00',
        title: 'Gaji Freelance Design',
        tone: 'income',
      },
      {
        amount: '-Rp 350.000',
        icon: '▢',
        meta: 'Dompet Utama • 14:20',
        title: 'Shopee Mall - Skincare',
        tone: 'expense',
      },
      {
        amount: '-Rp 45.000',
        icon: '□',
        meta: 'Gopay • 09:05',
        title: 'Kopi Kenangan',
        tone: 'expense',
      },
    ],
  },
] as const;

export {
  categories,
  fullHistoryGroups,
  histories,
  wallets,
};
