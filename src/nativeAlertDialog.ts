import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  processColor,
  type ColorValue,
} from 'react-native';

export type AlertButton = {
  id?: string;
  text?: string;
  textColor?: ColorValue;
  rippleColor?: ColorValue;
  order?: number;
  dismissOnPress?: boolean;
  onPress?: () => void;
  role?: 'default' | 'cancel' | 'destructive';
};

type NativeAlertButton = {
  id?: string;
  text?: string;
  textColor?: ColorValue;
  rippleColor?: ColorValue;
  order?: number;
  dismissOnPress?: boolean;
  role?: 'default' | 'cancel' | 'destructive';
};

export type AlertOptions = {
  title?: string;
  message?: string;
  iosPreferredStyle?: 'alert' | 'actionSheet';
  backgroundColor?: ColorValue;
  borderColor?: ColorValue;
  borderWidth?: number;
  cornerRadius?: number;
  titleColor?: ColorValue;
  messageColor?: ColorValue;
  loading?: boolean;
  loadingColor?: ColorValue;
  loadingSize?: number;
  dismissable?: boolean;
  buttons?: AlertButton[];
  onDismiss?: () => void;
};

type AlertEvent = {
  type: 'action' | 'dismiss';
  payload?: {
    id?: string;
  };
};

const MODULE_NAME = 'AlertDialogModule';

const NativeAlertDialog = NativeModules[MODULE_NAME] as
  | {
      show: (options: AlertOptions & { buttons?: NativeAlertButton[] }) => void;
      dismiss: () => void;
      addListener: (eventName: string) => void;
      removeListeners: (count: number) => void;
    }
  | undefined;

const emitter = NativeAlertDialog
  ? new NativeEventEmitter(NativeAlertDialog as any)
  : null;

let activeSubscription: { remove: () => void } | null = null;

export const Alert = {
  show(options: AlertOptions, onEvent?: (event: AlertEvent) => void) {
    if (!NativeAlertDialog) {
      throw new Error(
        `${MODULE_NAME} is not available on ${Platform.OS}. Did you run pod install?`
      );
    }
    const normalized = normalizeOptions(options);
    const { buttons, onDismiss } = options;
    const actionMap = new Map<string, AlertButton>();

    if (buttons) {
      buttons.forEach((button, index) => {
        const id = button.id ?? `action-${index}`;
        actionMap.set(id, button);
      });
    }

    if (emitter) {
      activeSubscription?.remove();
      activeSubscription = emitter.addListener(
        'AlertDialogEvent',
        (event: any) => {
          const typedEvent = event as AlertEvent;
          if (typedEvent.type === 'action') {
            const id = typedEvent.payload?.id;
            if (id && actionMap.has(id)) {
              actionMap.get(id)?.onPress?.();
            }
          }
          if (typedEvent.type === 'dismiss') {
            onDismiss?.();
          }
          onEvent?.(typedEvent);
        }
      );
    }

    NativeAlertDialog.show(normalized);
    return {
      dismiss: () => Alert.dismiss(),
    };
  },
  dismiss() {
    if (!NativeAlertDialog) {
      return;
    }
    activeSubscription?.remove();
    activeSubscription = null;
    NativeAlertDialog.dismiss();
  },
};

const normalizeColor = (value: ColorValue | undefined) => {
  if (value == null) {
    return undefined;
  }
  const processed = processColor(value);
  return typeof processed === 'number' ? processed : undefined;
};

const normalizeOptions = (options: AlertOptions) => {
  const { buttons, ...rest } = options;
  const restWithoutDismiss = { ...rest } as AlertOptions;
  delete (restWithoutDismiss as { onDismiss?: () => void }).onDismiss;
  return {
    ...restWithoutDismiss,
    backgroundColor: normalizeColor(options.backgroundColor),
    borderColor: normalizeColor(options.borderColor),
    titleColor: normalizeColor(options.titleColor),
    messageColor: normalizeColor(options.messageColor),
    loadingColor: normalizeColor(options.loadingColor),
    cancelable: options.dismissable ?? true,
    buttons: buttons?.map((button, index) => ({
      id: button.id ?? `action-${index}`,
      text: button.text,
      textColor: normalizeColor(button.textColor),
      rippleColor: normalizeColor(button.rippleColor),
      order: button.order,
      dismissOnPress: button.dismissOnPress,
      role: button.role,
    })),
  };
};
