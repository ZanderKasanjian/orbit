import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import {
  AttachmentID,
  AttachmentMIMEType,
  AttachmentReference,
  EntityType,
} from "@withorbit/core";
import { AttachmentStoreFS } from "./attachmentStoreFS";

let store: AttachmentStoreFS;
beforeEach(async () => {
  const tempPath = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "orbit-test-" + Math.random()),
  );
  store = new AttachmentStoreFS(tempPath, async () => AttachmentMIMEType.PNG);
});

const testAttachmentReference: AttachmentReference = {
  id: "x" as AttachmentID,
  createdAtTimestampMillis: 1000,
  type: EntityType.AttachmentReference,
  mimeType: AttachmentMIMEType.PNG,
};

test("non-existent ID URL resolves to null", async () => {
  expect(
    await store.getURLForStoredAttachment(testAttachmentReference.id),
  ).toBeNull();
});

test("after downloading URL resolves", async () => {
  // @ts-ignore
  const testBuffer = Buffer.from("Test");
  await store.storeAttachment(
    testBuffer,
    testAttachmentReference.id,
    testAttachmentReference.mimeType,
  );

  const url = await store.getURLForStoredAttachment(testAttachmentReference.id);
  expect(path.basename(url!)).toBe("x.png");

  const filePath = fileURLToPath(url!);
  const contents = await fs.promises.readFile(filePath, "utf-8");
  expect(contents).toBe("Test");

  expect(await store.getAttachmentContents(testAttachmentReference.id)).toEqual(
    testBuffer,
  );
});
