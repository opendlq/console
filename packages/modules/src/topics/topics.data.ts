export interface DlqTopic {
  name: string;
  sourceTopic: string;
  partitions: number;
  deadLetters: number;
  parked: number;
  oldest: string;
}

/** Dados de exemplo; troque por chamadas à API do seu cluster. */
export const DLQ_TOPICS: DlqTopic[] = [
  { name: 'payments.dlq', sourceTopic: 'payments.transactions', partitions: 8, deadLetters: 22810, parked: 1402, oldest: '9d' },
  { name: 'orders.dlq', sourceTopic: 'orders.created', partitions: 6, deadLetters: 8104, parked: 312, oldest: '3d' },
  { name: 'users.dlq', sourceTopic: 'users.registrations', partitions: 3, deadLetters: 940, parked: 12, oldest: '5h' },
  { name: 'shipping.dlq', sourceTopic: 'shipping.events', partitions: 4, deadLetters: 0, parked: 0, oldest: '—' },
];
