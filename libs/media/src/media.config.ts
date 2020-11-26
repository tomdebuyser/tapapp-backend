import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaConfig {
    constructor(
        readonly accessKeyId: string,
        readonly accessKeySecret: string,
        readonly region: string,
        readonly bucket: string,
    ) {}
}
