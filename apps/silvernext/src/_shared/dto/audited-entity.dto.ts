import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class AuditedEntityResponse {
    @ApiProperty({ required: true })
    id: string;

    @ApiProperty({ required: true })
    @Type(() => String)
    createdAt: Date;

    @ApiProperty({ required: true })
    @Type(() => String)
    updatedAt: Date;

    @ApiProperty({ required: false })
    createdBy?: string;

    @ApiProperty({ required: false })
    updatedBy?: string;
}
