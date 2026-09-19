import '../models/task.dart';
import 'api_client.dart';

class TaskService {
  final ApiClient _client;

  TaskService(this._client);

  Future<List<Task>> fetchTasks() async {
    final json = await _client.get('/tasks') as List<dynamic>;
    return json.map((e) => Task.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Task> createTask(TaskInput input) async {
    final json = await _client.post('/tasks', input.toJson());
    return Task.fromJson(json as Map<String, dynamic>);
  }

  Future<Task> updateTask(int id, TaskInput input) async {
    final json = await _client.put('/tasks/$id', input.toJson());
    return Task.fromJson(json as Map<String, dynamic>);
  }

  Future<void> deleteTask(int id) async {
    await _client.delete('/tasks/$id');
  }
}
