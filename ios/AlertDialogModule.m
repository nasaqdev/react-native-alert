#import "AlertDialogModule.h"

#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

@interface AlertDialogModule ()
@property (nonatomic, strong) UIAlertController *currentAlert;
@property (nonatomic, assign) BOOL hasListeners;
@end

@implementation AlertDialogModule

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[ @"AlertDialogEvent" ];
}

- (void)startObserving
{
  self.hasListeners = YES;
}

- (void)stopObserving
{
  self.hasListeners = NO;
}

RCT_EXPORT_METHOD(show:(NSDictionary *)options)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self dismissInternal:NO];

    NSString *title = [RCTConvert NSString:options[@"title"]];
    NSString *message = [RCTConvert NSString:options[@"message"]];
    NSString *preferredStyle = [RCTConvert NSString:options[@"iosPreferredStyle"]];
    UIAlertControllerStyle style = UIAlertControllerStyleAlert;
    if (preferredStyle != nil && [preferredStyle isEqualToString:@"actionSheet"]) {
      style = UIAlertControllerStyleActionSheet;
    }
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:title
                                                                   message:message
                                                            preferredStyle:style];

    NSArray *buttons = [RCTConvert NSArray:options[@"buttons"]];
    if (buttons != nil) {
      NSArray *sortedButtons = [self sortedButtons:buttons];
      NSArray *finalButtons =
        (style == UIAlertControllerStyleActionSheet)
          ? [self moveCancelToEnd:sortedButtons]
          : sortedButtons;
      [finalButtons enumerateObjectsUsingBlock:^(NSDictionary *entry, NSUInteger idx, BOOL *stop) {
        NSDictionary *button = entry[@"button"];
        NSNumber *indexValue = entry[@"index"];
        NSString *text = [RCTConvert NSString:button[@"text"]] ?: @"OK";
        NSString *identifier = [RCTConvert NSString:button[@"id"]] ?: [NSString stringWithFormat:@"action-%lu", (unsigned long)indexValue.unsignedIntegerValue];
        NSNumber *dismissOnPress = [RCTConvert NSNumber:button[@"dismissOnPress"]];
        NSString *role = [RCTConvert NSString:button[@"role"]];

        UIAlertActionStyle style = UIAlertActionStyleDefault;
        if (role != nil) {
          if ([role isEqualToString:@"destructive"]) {
            style = UIAlertActionStyleDestructive;
          } else if ([role isEqualToString:@"cancel"]) {
            style = UIAlertActionStyleCancel;
          }
        }

        UIAlertAction *action = [UIAlertAction actionWithTitle:text
                                                         style:style
                                                       handler:^(__unused UIAlertAction *act) {
          if (self.hasListeners) {
            [self sendEventWithName:@"AlertDialogEvent"
                               body:@{ @"type": @"action", @"payload": @{ @"id": identifier } }];
          }
          if (dismissOnPress == nil || dismissOnPress.boolValue) {
            [self dismissInternal:YES];
          }
        }];
        [alert addAction:action];
      }];
    }

    self.currentAlert = alert;
    UIViewController *presenter = RCTPresentedViewController();
    if (presenter != nil) {
      if (style == UIAlertControllerStyleActionSheet) {
        UIPopoverPresentationController *popover = alert.popoverPresentationController;
        if (popover != nil) {
          popover.sourceView = presenter.view;
          CGRect bounds = presenter.view.bounds;
          popover.sourceRect = CGRectMake(CGRectGetMidX(bounds), CGRectGetMidY(bounds), 1, 1);
          popover.permittedArrowDirections = 0;
        }
      }
      [presenter presentViewController:alert animated:YES completion:nil];
    }
  });
}

RCT_EXPORT_METHOD(dismiss)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self dismissInternal:YES];
  });
}

- (void)dismissInternal:(BOOL)emitDismiss
{
  if (self.currentAlert != nil) {
    [self.currentAlert dismissViewControllerAnimated:YES completion:nil];
    self.currentAlert = nil;
  }
  if (emitDismiss && self.hasListeners) {
    [self sendEventWithName:@"AlertDialogEvent" body:@{ @"type": @"dismiss" }];
  }
}

- (NSArray<NSDictionary *> *)sortedButtons:(NSArray *)buttons
{
  NSMutableArray<NSDictionary *> *wrapped = [NSMutableArray arrayWithCapacity:buttons.count];
  [buttons enumerateObjectsUsingBlock:^(NSDictionary *button, NSUInteger idx, BOOL *stop) {
    NSNumber *order = [RCTConvert NSNumber:button[@"order"]];
    [wrapped addObject:@{ @"button": button, @"index": @(idx), @"order": order ?: [NSNull null] }];
  }];

  [wrapped sortUsingComparator:^NSComparisonResult(NSDictionary *a, NSDictionary *b) {
    id orderA = a[@"order"];
    id orderB = b[@"order"];
    if (orderA != [NSNull null] && orderB != [NSNull null]) {
      return [orderA compare:orderB];
    }
    if (orderA != [NSNull null]) {
      return NSOrderedAscending;
    }
    if (orderB != [NSNull null]) {
      return NSOrderedDescending;
    }
    return [a[@"index"] compare:b[@"index"]];
  }];

  return wrapped;
}

- (NSArray<NSDictionary *> *)moveCancelToEnd:(NSArray<NSDictionary *> *)buttons
{
  NSMutableArray<NSDictionary *> *nonCancel = [NSMutableArray array];
  NSDictionary *cancelButton = nil;
  for (NSDictionary *entry in buttons) {
    NSDictionary *button = entry[@"button"];
    NSString *role = [RCTConvert NSString:button[@"role"]];
    if (role != nil && [role isEqualToString:@"cancel"]) {
      cancelButton = entry;
    } else {
      [nonCancel addObject:entry];
    }
  }
  if (cancelButton != nil) {
    [nonCancel addObject:cancelButton];
  }
  return nonCancel;
}

@end
