import 'package:flutter/foundation.dart';
import '../models/auth_user.dart';
import 'api_client.dart';

class AuthService extends ChangeNotifier {
  final ApiClient _client;
  AuthUser? _user;
  bool _initializing = true;

  AuthService(this._client);

  AuthUser? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get initializing => _initializing;
  ApiClient get client => _client;

  Future<void> bootstrap() async {
    await _client.loadToken();
    if (_client.hasToken) {
      try {
        final json = await _client.get('/users/me');
        _user = AuthUser(
          userId: json['id'] as int,
          username: json['username'] as String,
          email: json['email'] as String,
        );
      } catch (_) {
        await _client.setToken(null);
        _user = null;
      }
    }
    _initializing = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final json = await _client.post('/auth/login', {'email': email, 'password': password});
    await _client.setToken(json['token'] as String);
    _user = AuthUser.fromLoginJson(json as Map<String, dynamic>);
    notifyListeners();
  }

  Future<void> register(String username, String email, String password) async {
    final json = await _client.post('/auth/register', {
      'username': username,
      'email': email,
      'password': password,
    });
    await _client.setToken(json['token'] as String);
    _user = AuthUser.fromLoginJson(json as Map<String, dynamic>);
    notifyListeners();
  }

  Future<void> logout() async {
    await _client.setToken(null);
    _user = null;
    notifyListeners();
  }
}
