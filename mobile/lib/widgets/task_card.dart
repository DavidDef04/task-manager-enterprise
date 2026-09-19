import 'package:flutter/material.dart';

import '../models/task.dart';
import '../theme/app_theme.dart';

const _frMonths = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

const Map<TaskStatus, Color> _statusAccent = {
  TaskStatus.todo: AppColors.slate400,
  TaskStatus.inProgress: AppColors.amber500,
  TaskStatus.done: AppColors.emerald500,
};

const Map<TaskStatus, Color> _statusBg = {
  TaskStatus.todo: AppColors.slate100,
  TaskStatus.inProgress: Color(0xFFFEF3C7),
  TaskStatus.done: Color(0xFFD1FAE5),
};

const Map<TaskStatus, Color> _statusFg = {
  TaskStatus.todo: AppColors.slate600,
  TaskStatus.inProgress: Color(0xFF92400E),
  TaskStatus.done: Color(0xFF065F46),
};

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const TaskCard({
    super.key,
    required this.task,
    required this.onEdit,
    required this.onDelete,
  });

  String _formatDueDate(DateTime due) {
    final today = DateTime.now();
    final todayOnly = DateTime(today.year, today.month, today.day);
    final diff = due.difference(todayOnly).inDays;
    if (diff == 0) return "Aujourd'hui";
    if (diff == 1) return 'Demain';
    if (diff == -1) return 'Hier';
    return '${due.day} ${_frMonths[due.month - 1]}';
  }

  @override
  Widget build(BuildContext context) {
    final overdue = task.isOverdue;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(14),
          bottomRight: Radius.circular(14),
        ),
        border: Border.all(color: AppColors.slate200),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(width: 4, color: _statusAccent[task.status]),
            Expanded(
              child: InkWell(
                onTap: onEdit,
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              task.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(
                              Icons.edit_outlined,
                              size: 19,
                              color: AppColors.slate400,
                            ),
                            onPressed: onEdit,
                            visualDensity: VisualDensity.compact,
                          ),
                          IconButton(
                            icon: const Icon(
                              Icons.delete_outline,
                              size: 19,
                              color: AppColors.slate400,
                            ),
                            onPressed: onDelete,
                            visualDensity: VisualDensity.compact,
                          ),
                        ],
                      ),
                      if (task.description != null &&
                          task.description!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          task.description!,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.slate500,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          _Badge(
                            label: task.status.label,
                            bg: _statusBg[task.status]!,
                            fg: _statusFg[task.status]!,
                          ),
                          if (task.dueDate != null)
                            _Badge(
                              label: _formatDueDate(task.dueDate!),
                              bg: overdue
                                  ? const Color(0xFFFEF2F2)
                                  : const Color(0xFFEEF2FF),
                              fg: overdue ? AppColors.red500 : AppColors.indigo,
                              icon: Icons.calendar_today_outlined,
                            ),
                          if (task.estimatedHours != null)
                            _Badge(
                              label: '${task.estimatedHours}h',
                              bg: const Color(0xFFF5F3FF),
                              fg: const Color(0xFF7C3AED),
                              icon: Icons.access_time_rounded,
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color bg;
  final Color fg;
  final IconData? icon;

  const _Badge({
    required this.label,
    required this.bg,
    required this.fg,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: fg),
            const SizedBox(width: 3),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}
