import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import styles from './BottomSheet.styles';

const CLOSE_DRAG_DISTANCE = 90;
const START_DRAG_DISTANCE = 8;

type BottomSheetDragHandleProps = ReturnType<
  typeof PanResponder.create
>['panHandlers'];

type BottomSheetChildren =
  | ReactNode
  | ((props: { dragHandleProps: BottomSheetDragHandleProps }) => ReactNode);

type BottomSheetProps = {
  children: BottomSheetChildren;
  containerStyle: StyleProp<ViewStyle>;
  disableClose?: boolean;
  dragFromHandleOnly?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  onClose: () => void;
  visible: boolean;
};

function finishSheetDrag(
  dragY: Animated.Value,
  gesture: PanResponderGestureState,
  onClose: () => void,
) {
  if (gesture.dy > CLOSE_DRAG_DISTANCE) {
    onClose();

    return;
  }

  Animated.spring(dragY, {
    toValue: 0,
    useNativeDriver: true,
  }).start();
}

function shouldStartDrag(gesture: PanResponderGestureState) {
  return gesture.dy > START_DRAG_DISTANCE
    && Math.abs(gesture.dy) > Math.abs(gesture.dx);
}

function createSheetPanResponder(
  dragY: Animated.Value,
  onClose: () => void,
  claimStart = false,
) {
  return PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => shouldStartDrag(gesture),
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldStartDrag(gesture),
    onPanResponderGrant: () => dragY.stopAnimation(),
    onPanResponderMove: (
      _: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => dragY.setValue(Math.max(gesture.dy, 0)),
    onPanResponderRelease: (
      _: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => finishSheetDrag(dragY, gesture, onClose),
    onPanResponderTerminate: () => dragY.setValue(0),
    onPanResponderTerminationRequest: () => false,
    onStartShouldSetPanResponder: () => claimStart,
  });
}

function useSheetDrag(props: { onClose: () => void; visible: boolean }) {
  const [dragY] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (props.visible) {
      dragY.setValue(0);
    }
  }, [dragY, props.visible]);

  const panResponder = useMemo(
    () => createSheetPanResponder(dragY, props.onClose),
    [dragY, props.onClose],
  );
  const dragHandleResponder = useMemo(
    () => createSheetPanResponder(dragY, props.onClose, true),
    [dragY, props.onClose],
  );

  return { dragHandleResponder, dragY, panResponder };
}

function renderChildren(
  children: BottomSheetChildren,
  dragHandleProps: BottomSheetDragHandleProps,
) {
  if (typeof children === 'function') {
    return children({ dragHandleProps });
  }

  return children;
}

function SheetSurface(props: {
  children: ReactNode;
  containerStyle: StyleProp<ViewStyle>;
  dragY: Animated.Value;
  isLoading?: boolean;
  loadingLabel?: string;
  panHandlers?: BottomSheetDragHandleProps;
}) {
  return (
    <Animated.View
      style={[props.containerStyle, { transform: [{ translateY: props.dragY }] }]}
      {...props.panHandlers}
    >
      {props.children}
      {props.isLoading ? <SheetLoadingOverlay label={props.loadingLabel} /> : null}
    </Animated.View>
  );
}

function SheetLoadingOverlay(props: { label?: string }) {
  return (
    <Pressable style={styles.loadingOverlay}>
      <ActivityIndicator color={styles.loadingSpinner.color} size="large" />
      {props.label ? <Animated.Text style={styles.loadingText}>{props.label}</Animated.Text> : null}
    </Pressable>
  );
}

function getSheetInteractionState(props: BottomSheetProps) {
  return Boolean(props.isLoading || props.disableClose);
}

function getSheetHandlers(
  props: BottomSheetProps,
  responders: ReturnType<typeof useSheetDrag>,
  isInteractionDisabled: boolean,
) {
  const shouldDisableSurfaceDrag = isInteractionDisabled || props.dragFromHandleOnly;

  return {
    onClose: isInteractionDisabled ? () => undefined : props.onClose,
    panHandlers: shouldDisableSurfaceDrag ? undefined : responders.panResponder.panHandlers,
    renderDragHandleProps: isInteractionDisabled
      ? {} as BottomSheetDragHandleProps
      : responders.dragHandleResponder.panHandlers,
  };
}

function BottomSheetModalContent(props: {
  children: ReactNode;
  containerStyle: StyleProp<ViewStyle>;
  dragY: Animated.Value;
  isLoading?: boolean;
  loadingLabel?: string;
  onClose: () => void;
  panHandlers?: BottomSheetDragHandleProps;
}) {
  return (
    <Animated.View style={styles.container}>
      <Pressable onPress={props.onClose} style={styles.scrim} />
      <SheetSurface
        containerStyle={props.containerStyle}
        dragY={props.dragY}
        isLoading={props.isLoading}
        loadingLabel={props.loadingLabel}
        panHandlers={props.panHandlers}
      >
        {props.children}
      </SheetSurface>
    </Animated.View>
  );
}

function BottomSheet(props: BottomSheetProps) {
  const responders = useSheetDrag(props);
  const isInteractionDisabled = getSheetInteractionState(props);
  const handlers = getSheetHandlers(props, responders, isInteractionDisabled);
  const children = renderChildren(props.children, handlers.renderDragHandleProps);

  return (
    <Modal
      animationType="slide"
      onRequestClose={handlers.onClose}
      transparent visible={props.visible}
    >
      <BottomSheetModalContent
        children={children}
        containerStyle={props.containerStyle}
        dragY={responders.dragY}
        isLoading={props.isLoading}
        loadingLabel={props.loadingLabel}
        onClose={handlers.onClose}
        panHandlers={handlers.panHandlers}
      />
    </Modal>
  );
}

export default BottomSheet;
export type { BottomSheetDragHandleProps };
