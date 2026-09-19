import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/task.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/task_service.dart';
import '../widgets/brand_mark.dart';
import '../widgets/task_card.dart';
import '../theme/app_theme.dart';
import 'task_form_screen.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  List<Task> _tasks = [];
  bool _loading = true;
  TaskStatus? _statusFilter;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final tasks = await context.read<TaskService>().fetchTasks();
      if (mounted) setState(() => _tasks = tasks);
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Impossible de charger les tâches')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<Task> get _filtered =>
      _statusFilter == null ? _tasks : _tasks.where((t) => t.status == _statusFilter).toList();

  Future<void> _openForm({Task? task}) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => TaskFormScreen(task: task)),
    );
    if (result == true) _load();
  }

  Future<void> _confirmDelete(Task task) async {
    final taskService = context.read<TaskService>();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer la tâche'),
        content: Text('Voulez-vous vraiment supprimer « ${task.title} » ? Cette action est irréversible.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Supprimer', style: TextStyle(color: AppColors.red500)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await taskService.deleteTask(task.id);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tâche supprimée')));
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  int _count(TaskStatus? status) =>
      status == null ? _tasks.length : _tasks.where((t) => t.status == status).length;

  @override
  Widget build(BuildContext context) {
    final username = context.watch<AuthService>().user?.username ?? '';

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const BrandMark(size: 32),
            const SizedBox(width: 10),
            const Text('Task Manager', style: TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_outlined),
            tooltip: 'Déconnexion',
            onPressed: () => context.read<AuthService>().logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
                children: [
                  Text(
                    'Bon retour, $username',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  const Text("Voici ce qui vous attend aujourd'hui.", style: TextStyle(color: Colors.black54)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _StatCard(label: 'Total', value: _count(null), color: AppColors.indigo)),
                      const SizedBox(width: 8),
                      Expanded(
                          child: _StatCard(label: 'À faire', value: _count(TaskStatus.todo), color: AppColors.slate600)),
                      const SizedBox(width: 8),
                      Expanded(
                          child: _StatCard(
                              label: 'En cours', value: _count(TaskStatus.inProgress), color: AppColors.amber500)),
                      const SizedBox(width: 8),
                      Expanded(
                          child: _StatCard(
                              label: 'Terminées', value: _count(TaskStatus.done), color: AppColors.emerald500)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _FilterChip(label: 'Tous', selected: _statusFilter == null, onTap: () => setState(() => _statusFilter = null)),
                        _FilterChip(label: 'À faire', selected: _statusFilter == TaskStatus.todo, onTap: () => setState(() => _statusFilter = TaskStatus.todo)),
                        _FilterChip(label: 'En cours', selected: _statusFilter == TaskStatus.inProgress, onTap: () => setState(() => _statusFilter = TaskStatus.inProgress)),
                        _FilterChip(label: 'Terminées', selected: _statusFilter == TaskStatus.done, onTap: () => setState(() => _statusFilter = TaskStatus.done)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (_filtered.isEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 40),
                      child: Column(
                        children: [
                          const Icon(Icons.description_outlined, size: 40, color: AppColors.slate400),
                          const SizedBox(height: 10),
                          const Text('Aucune tâche ne correspond à vos filtres',
                              style: TextStyle(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          const Text('Créez une tâche ou ajustez les filtres ci-dessus',
                              style: TextStyle(color: Colors.black54, fontSize: 13)),
                        ],
                      ),
                    )
                  else
                    ..._filtered.map(
                      (task) => TaskCard(
                        task: task,
                        onEdit: () => _openForm(task: task),
                        onDelete: () => _confirmDelete(task),
                      ),
                    ),
                ],
              ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(),
        backgroundColor: AppColors.indigo,
        foregroundColor: Colors.white,
        elevation: 2,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'Nouvelle tâche',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _StatCard({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.slate200),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$value', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.black54)),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: AppColors.indigo,
        labelStyle: TextStyle(
          color: selected ? Colors.white : AppColors.slate600,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
        backgroundColor: AppColors.slate100,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide.none),
      ),
    );
  }
}
