/*
 * Public API de @opendlq/ui — design system do console de Dead Letter Queue.
 */
export * from './lib/types';

// Fundação
export * from './lib/theme/theme';
export * from './lib/icon/icon';
export { ICON_NAMES, type OdlqIconName } from './lib/icon/icons';
export * from './lib/form/control';

// Primitivos
export * from './lib/button/button';
export * from './lib/button/icon-button';
export * from './lib/input/input';
export * from './lib/input/textarea';
export * from './lib/select/select';
export * from './lib/checkbox/checkbox';
export * from './lib/toggle/toggle';
export * from './lib/radio/radio-group';
export * from './lib/segmented-control/segmented-control';
export * from './lib/badge/badge';
export * from './lib/chip/chip';
export * from './lib/kbd/kbd';
export * from './lib/tooltip/tooltip';
export * from './lib/avatar/avatar';
export * from './lib/spinner/spinner';
export * from './lib/skeleton/skeleton';
export * from './lib/divider/divider';
export * from './lib/form-field/form-field';
export * from './lib/alert/alert';

// Navegação / layout
export * from './lib/layout/brand';
export * from './lib/layout/sidebar';
export * from './lib/layout/topbar';
export * from './lib/layout/app-shell';
export * from './lib/layout/page-header';
export * from './lib/tabs/tabs';
export * from './lib/pagination/pagination';
export * from './lib/command-palette/command-palette';

// Dados e código
export * from './lib/kpi/kpi';
export * from './lib/data-table/data-table';
export * from './lib/data-table/key-value-table';
export * from './lib/empty-state/empty-state';
export * from './lib/card/card';
export * from './lib/card/doc-panel';
export * from './lib/accordion/accordion';
export * from './lib/progress/progress';
export * from './lib/code/highlight';
export * from './lib/code/diff';
export * from './lib/code/code-line';
export * from './lib/code/code-block';
export * from './lib/code/code-editor';
export * from './lib/code/diff-viewer';

// Overlays
export * from './lib/drawer/drawer';
export * from './lib/modal/modal';
export * from './lib/menu/menu';
export * from './lib/toast/toast';

// Gráficos
export * from './lib/charts/chart-utils';
export * from './lib/charts/bar-chart';
export * from './lib/charts/line-chart';
export * from './lib/charts/legend';

// DLQ
export * from './lib/domain';
export * from './lib/charts/sparkline';
export * from './lib/dlq/state-badge';
export * from './lib/dlq/kind-badge';
export * from './lib/dlq/state-strip';
export * from './lib/dlq/funnel';
export * from './lib/dlq/filter-bar';
export * from './lib/dlq/group-table';
export * from './lib/dlq/message-table';
export * from './lib/dlq/bulk-action-bar';
export * from './lib/dlq/attempt-timeline';
export * from './lib/dlq/header-list';
export * from './lib/dlq/log-extract';
export * from './lib/dlq/message-detail-drawer';
export * from './lib/dlq/replay-drawer';
export * from './lib/dlq/reclassify-dialog';
export * from './lib/dlq/breaker-card';
export * from './lib/dlq/runbook-card';
export * from './lib/dlq/risk-card';
export * from './lib/dlq/audit-log';
