export function isAdmin(user) {
  return user?.role === 'admin';
}

export function isMember(user) {
  return user?.role === 'member';
}

export function canManage(user) {
  return isAdmin(user);
}
