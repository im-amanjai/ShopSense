package shopsense.auth;

import shopsense.user.Role;

public record CurrentUserResponse(
        Long userId,
        String name,
        String email,
        Role role
) {
}