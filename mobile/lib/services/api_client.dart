import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Change this to reach your backend:
/// - Android emulator talking to a backend on the same host machine: http://10.0.2.2:8081/api
/// - Physical device on the same Wi-Fi as the backend host: http://HOST_LAN_IP:8081/api
const String apiBaseUrl = 'http://192.168.1.144:8081/api';

class ApiException implements Exception {
  final int statusCode;
  final String message;
  final Map<String, String>? validationErrors;

  ApiException(this.statusCode, this.message, {this.validationErrors});

  @override
  String toString() => message;
}

class ApiClient {
  static const _tokenKey = 'auth_token';
  String? _token;

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
  }

  Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token == null) {
      await prefs.remove(_tokenKey);
    } else {
      await prefs.setString(_tokenKey, token);
    }
  }

  bool get hasToken => _token != null;

  Map<String, String> _headers({bool json = true}) {
    final headers = <String, String>{};
    if (json) headers['Content-Type'] = 'application/json';
    if (_token != null) headers['Authorization'] = 'Bearer $_token';
    return headers;
  }

  Future<dynamic> get(String path) async {
    final res = await http.get(Uri.parse('$apiBaseUrl$path'), headers: _headers());
    return _handle(res);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final res = await http.post(
      Uri.parse('$apiBaseUrl$path'),
      headers: _headers(),
      body: jsonEncode(body),
    );
    return _handle(res);
  }

  Future<dynamic> put(String path, Map<String, dynamic> body) async {
    final res = await http.put(
      Uri.parse('$apiBaseUrl$path'),
      headers: _headers(),
      body: jsonEncode(body),
    );
    return _handle(res);
  }

  Future<void> delete(String path) async {
    final res = await http.delete(Uri.parse('$apiBaseUrl$path'), headers: _headers());
    _handle(res);
  }

  dynamic _handle(http.Response res) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.body.isEmpty) return null;
      return jsonDecode(utf8.decode(res.bodyBytes));
    }

    String message = 'Une erreur est survenue (${res.statusCode})';
    Map<String, String>? validationErrors;
    try {
      final decoded = jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
      if (decoded['message'] != null) message = decoded['message'] as String;
      if (decoded['validationErrors'] != null) {
        validationErrors = (decoded['validationErrors'] as Map<String, dynamic>)
            .map((key, value) => MapEntry(key, value.toString()));
      }
    } catch (_) {
      // response body wasn't JSON (e.g. connection-level error page); keep the generic message
    }
    throw ApiException(res.statusCode, message, validationErrors: validationErrors);
  }
}
