export enum UserRoles {
  ADMIN = "Admin",
  USER = "User",
}

export enum Permissions {
  USER_CREATE = "user:create",
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  USER_LIST = "user:list",

  COURSE_CREATE = "course:create",
  COURSE_READ = "course:read",
  COURSE_UPDATE = "course:update",
  COURSE_DELETE = "course:delete",
  COURSE_LIST = "course:list",
  COURSE_PUBLISH = "course:publish",

  CHAPTER_CREATE = "chapter:create",
  CHAPTER_READ = "chapter:read",
  CHAPTER_UPDATE = "chapter:update",
  CHAPTER_DELETE = "chapter:delete",

  LESSON_CREATE = "lesson:create",
  LESSON_READ = "lesson:read",
  LESSON_UPDATE = "lesson:update",
  LESSON_DELETE = "lesson:delete",

  ENROLLMENT_CREATE = "enrollment:create",
  ENROLLMENT_READ = "enrollment:read",
  ENROLLMENT_DELETE = "enrollment:delete",

  QUIZ_CREATE = "quiz:create",
  QUIZ_READ = "quiz:read",
  QUIZ_UPDATE = "quiz:update",
  QUIZ_DELETE = "quiz:delete",

  ROLE_CREATE = "role:create",
  ROLE_READ = "role:read",
  ROLE_UPDATE = "role:update",
  ROLE_DELETE = "role:delete",
  ROLE_ASSIGN = "role:assign",
}

export const RolePermissions: Record<UserRoles, Permissions[]> = {
  [UserRoles.ADMIN]: [
    Permissions.USER_CREATE,
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
    Permissions.USER_DELETE,
    Permissions.USER_LIST,
    Permissions.COURSE_CREATE,
    Permissions.COURSE_READ,
    Permissions.COURSE_UPDATE,
    Permissions.COURSE_DELETE,
    Permissions.COURSE_LIST,
    Permissions.COURSE_PUBLISH,
    Permissions.CHAPTER_CREATE,
    Permissions.CHAPTER_READ,
    Permissions.CHAPTER_UPDATE,
    Permissions.CHAPTER_DELETE,
    Permissions.LESSON_CREATE,
    Permissions.LESSON_READ,
    Permissions.LESSON_UPDATE,
    Permissions.LESSON_DELETE,
    Permissions.ENROLLMENT_CREATE,
    Permissions.ENROLLMENT_READ,
    Permissions.ENROLLMENT_DELETE,
    Permissions.QUIZ_CREATE,
    Permissions.QUIZ_READ,
    Permissions.QUIZ_UPDATE,
    Permissions.QUIZ_DELETE,
    Permissions.ROLE_CREATE,
    Permissions.ROLE_READ,
    Permissions.ROLE_UPDATE,
    Permissions.ROLE_DELETE,
    Permissions.ROLE_ASSIGN,
  ],

  [UserRoles.USER]: [
    Permissions.COURSE_READ,
    Permissions.COURSE_LIST,
    Permissions.CHAPTER_READ,
    Permissions.LESSON_READ,
    Permissions.ENROLLMENT_READ,
    Permissions.QUIZ_READ,
  ],
};

export function hasPermission(
  role: UserRoles,
  permission: Permissions
): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}
