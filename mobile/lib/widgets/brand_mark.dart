import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class BrandMark extends StatelessWidget {
  final double size;

  const BrandMark({super.key, this.size = 56});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: AppTheme.gradient,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(size * 0.32),
          topRight: Radius.circular(size * 0.08),
          bottomRight: Radius.circular(size * 0.32),
          bottomLeft: Radius.circular(size * 0.08),
        ),
      ),
      child: Icon(Icons.check_circle_rounded, color: Colors.white, size: size * 0.55),
    );
  }
}
