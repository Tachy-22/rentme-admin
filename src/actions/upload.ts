'use server'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface UploadParams {
  buffer: ArrayBuffer;
  filename: string;
  contentType: string;
}

function generateUniqueFilename(originalFilename: string): string {
  const hash = crypto.createHash('sha256')
    .update(originalFilename + process.hrtime.bigint().toString())
    .digest('hex')
    .slice(0, 8);
  return `${hash}-${originalFilename}`;
}

export async function uploadFile(params: UploadParams): Promise<{ url: string; error?: never } | { url?: never; error: string }> {
  try {
    const uniqueFilename = generateUniqueFilename(params.filename);
    const key = `uploads/${uniqueFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: Buffer.from(params.buffer),
      ContentType: params.contentType,
    });

    await s3.send(command);
    const url = `${process.env.CLOUD_FRONT_URL}/${key}`;
    console.log({url})
    return { url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Upload failed' };
  }
}