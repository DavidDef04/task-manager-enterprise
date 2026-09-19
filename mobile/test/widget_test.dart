import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:task_manager_mobile/main.dart';

void main() {
  testWidgets('shows the login screen when logged out', (WidgetTester tester) async {
    await tester.pumpWidget(const TaskManagerApp());
    await tester.pump();

    expect(find.text('Content de vous revoir'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Se connecter'), findsOneWidget);
  });
}
