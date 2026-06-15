package shopsense.auth;

import shopsense.user.Role;

public record AuthResponse(
        String token,
        Long userId,
        String name,
        String email,
        Role role
) {
}