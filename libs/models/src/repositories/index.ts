import { RoleRepository } from './role.repository';
import { UserRepository } from './user.repository';

export * from './role.repository';
export * from './user.repository';
export const repositories = [RoleRepository, UserRepository];
