import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'kyc-documents';
    
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin',
    });
  }

  async onModuleInit() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
    }
  }

  async uploadFile(bucketName: string, objectName: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.minioClient.putObject(bucketName, objectName, buffer, undefined, {
      'Content-Type': mimeType,
    });
    return objectName;
  }

  async getFileAsBase64(bucketName: string, objectName: string): Promise<string> {
    try {
      const dataStream = await this.minioClient.getObject(bucketName, objectName);
      return new Promise((resolve, reject) => {
        let data = '';
        dataStream.setEncoding('base64');
        dataStream.on('data', (chunk: any) => {
          data += chunk;
        });
        dataStream.on('end', () => {
          resolve(data);
        });
        dataStream.on('error', (err: any) => {
          reject(err);
        });
      });
    } catch (err) {
      throw err;
    }
  }

  getBucketName(): string {
    return this.bucketName;
  }
}
