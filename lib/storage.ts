import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type StorageConfig = {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

let storageClient: S3Client | undefined;

function getStorageConfig(): StorageConfig {
  const endpoint = process.env.SUPABASE_BUCKET_URL;
  const bucket = process.env.BUCKET_NAME;
  const region = process.env.BUCKET_REGION;
  const accessKeyId = process.env.BUCKET_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY;

  if (!endpoint || !bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("Faltan las credenciales del bucket de Supabase.");
  }

  return { endpoint, bucket, region, accessKeyId, secretAccessKey };
}

function getStorageClient(config: StorageConfig) {
  if (!storageClient) {
    storageClient = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return storageClient;
}

function publicUrl(config: StorageConfig, path: string) {
  const publicBase = config.endpoint.replace(
    /\/storage\/v1\/s3\/?$/,
    "/storage/v1/object/public/" + encodeURIComponent(config.bucket),
  );
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return publicBase + "/" + encodedPath;
}

function safeFolder(value: string | undefined) {
  const normalized = (value ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  return normalized || "drafts";
}

export async function uploadBlogImage(file: File, postId?: string) {
  const config = getStorageConfig();
  const extension =
    ALLOWED_IMAGE_TYPES[file.type as keyof typeof ALLOWED_IMAGE_TYPES];

  if (!extension) {
    throw new Error("Formato no permitido. Usá JPG, PNG o WEBP.");
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("La imagen debe pesar más de 0 y como máximo 5 MB.");
  }

  const path = "posts/" + safeFolder(postId) + "/" + randomUUID() + "." + extension;
  const body = Buffer.from(await file.arrayBuffer());
  const client = getStorageClient(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: path,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    path,
    url: publicUrl(config, path),
  };
}

export async function deleteBlogImage(path: string) {
  const config = getStorageConfig();

  if (!path.startsWith("posts/") || path.includes("..")) {
    throw new Error("Ruta de imagen no válida.");
  }

  await getStorageClient(config).send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: path,
    }),
  );
}
