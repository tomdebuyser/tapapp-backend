import { IsBoolean, IsOptional } from 'class-validator';

class RolePermissionsDto {
    @IsBoolean()
    @IsOptional()
    readonly view?: boolean;

    @IsBoolean()
    @IsOptional()
    readonly edit?: boolean;
}

class UserPermissionsDto {
    @IsBoolean()
    @IsOptional()
    readonly view?: boolean;

    @IsBoolean()
    @IsOptional()
    readonly edit?: boolean;
}

export class PermissionsDto {
    @IsOptional()
    readonly roles?: RolePermissionsDto;

    @IsOptional()
    readonly users?: UserPermissionsDto;
}
