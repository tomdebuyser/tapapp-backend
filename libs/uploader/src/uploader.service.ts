import { Injectable } from '@nestjs/common';
import { config as AwsConfig, S3 } from 'aws-sdk';
import { Body, ObjectCannedACL } from 'aws-sdk/clients/s3';

import { LoggerService } from '@libs/logger';
import { UploaderConfig } from './uploader.config';

const context = 'UploaderService';

@Injectable()
export class UploaderService {
    private readonly s3: S3;

    constructor(
        private readonly config: UploaderConfig,
        private readonly logger: LoggerService,
    ) {
        AwsConfig.update({
            region: this.config.region,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.accessKeySecret,
            },
        });

        this.s3 = new S3();
    }

    getFile(key: string, bucket: string): Promise<S3.GetObjectOutput> {
        this.logger.debug('Getting single file from S3', {
            context,
            key,
            bucket,
        });
        return this.s3.getObject({ Bucket: bucket, Key: key }).promise();
    }

    listFiles(bucket: string): Promise<S3.ListObjectsOutput> {
        this.logger.debug('List files on S3', {
            context,
            bucket,
        });
        return this.s3.listObjects({ Bucket: bucket }).promise();
    }

    uploadFile(
        key: string,
        bucket: string,
        fileBody: Body,
        mimeType: string,
        permission: ObjectCannedACL = 'public-read',
    ): Promise<S3.ManagedUpload.SendData> {
        this.logger.debug('Uploading file to S3', {
            context,
            key,
            bucket,
        });
        return this.s3
            .upload({
                Bucket: bucket,
                ACL: permission,
                Key: key,
                Body: fileBody,
                ContentType: mimeType,
            })
            .promise();
    }

    deleteFile(key: string, bucket: string): Promise<S3.DeleteObjectOutput> {
        this.logger.debug('Deleting file from S3', {
            context,
            key,
            bucket,
        });
        return this.s3
            .deleteObject({
                Bucket: bucket,
                Key: key,
            })
            .promise();
    }
}
