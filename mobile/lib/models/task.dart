enum TaskStatus { todo, inProgress, done }

extension TaskStatusApi on TaskStatus {
  static TaskStatus fromApi(String value) {
    switch (value) {
      case 'IN_PROGRESS':
        return TaskStatus.inProgress;
      case 'DONE':
        return TaskStatus.done;
      case 'TODO':
      default:
        return TaskStatus.todo;
    }
  }

  String toApi() {
    switch (this) {
      case TaskStatus.todo:
        return 'TODO';
      case TaskStatus.inProgress:
        return 'IN_PROGRESS';
      case TaskStatus.done:
        return 'DONE';
    }
  }

  String get label {
    switch (this) {
      case TaskStatus.todo:
        return 'À faire';
      case TaskStatus.inProgress:
        return 'En cours';
      case TaskStatus.done:
        return 'Terminée';
    }
  }
}

class Task {
  final int id;
  final String title;
  final String? description;
  final TaskStatus status;
  final DateTime? dueDate;
  final double? estimatedHours;
  final DateTime createdAt;
  final DateTime updatedAt;

  Task({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.dueDate,
    required this.estimatedHours,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      status: TaskStatusApi.fromApi(json['status'] as String),
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate'] as String) : null,
      estimatedHours: (json['estimatedHours'] as num?)?.toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  bool get isOverdue {
    if (dueDate == null || status == TaskStatus.done) return false;
    final today = DateTime.now();
    final todayOnly = DateTime(today.year, today.month, today.day);
    return dueDate!.isBefore(todayOnly);
  }
}

class TaskInput {
  final String title;
  final String description;
  final TaskStatus status;
  final DateTime? dueDate;
  final double? estimatedHours;

  TaskInput({
    required this.title,
    required this.description,
    required this.status,
    required this.dueDate,
    required this.estimatedHours,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'status': status.toApi(),
      'dueDate': dueDate == null
          ? null
          : '${dueDate!.year.toString().padLeft(4, '0')}-${dueDate!.month.toString().padLeft(2, '0')}-${dueDate!.day.toString().padLeft(2, '0')}',
      'estimatedHours': estimatedHours,
    };
  }
}
