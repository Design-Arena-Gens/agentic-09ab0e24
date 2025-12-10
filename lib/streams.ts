import { Readable } from 'stream';

export function bufferToStream(buffer: Buffer): Readable {
  return Readable.from(buffer);
}

export async function webStreamToNode(stream: ReadableStream<Uint8Array>): Promise<Readable> {
  return Readable.fromWeb(stream as unknown as any);
}
