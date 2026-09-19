class AuthUser {
  final int userId;
  final String username;
  final String email;

  AuthUser({required this.userId, required this.username, required this.email});

  factory AuthUser.fromLoginJson(Map<String, dynamic> json) {
    return AuthUser(
      userId: json['userId'] as int,
      username: json['username'] as String,
      email: json['email'] as String,
    );
  }
}
