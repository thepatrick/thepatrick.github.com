---
title: Uploader
pubDate: "2021-01-31"
description: >
  So you want to upload large files from your users browsers, directly to S3. You'll find plenty of examples of how to do this by uploading the whole thing in one go, but S3 supports multipart uploads - where you divide the file into chunks, which you can then upload in parallel (and even retry if something goes wrong!).
---

So you want to upload large files from your users browsers, directly to S3. You'll find plenty of examples of how to do this by uploading the whole thing in one go, but S3 supports multipart uploads - where you divide the file into chunks, which you can then upload in parallel (and even retry if something goes wrong!).

## The example

[video-uploader](https://github.com/thepatrick/video-uploader). The includes a bunch of pieces:

* Frontend that allows picking a file and uploading it
* Backend lambdas (these wrap the amazon API calls, the data being uploaded to S3 do not pass through a lambda)
* CloudFormation to deploy the frontend + lambdas + API gateways + CloudFront.

While the upload code is not a seperate component, the files in the `frontend/src/uploader` directory do not modify the DOM directly so should be relatively easy to drop into other projects.

## What you have to do

1. (Frontend) User chooses a file
2. (Backend) Create a Multipart Upload
3. (Backend) Create a signed URL for each part
4. (Frontend) Upload each part
5. (Backend) Complete upload
6. Handle failed uploads

### (Frontend) User chooses a file

1. Let the user pick a file, using an `<input type="file">`. From here on we'll refer to this input using the variable `fileInput` (in the example I get this using [document.getElementById](https://github.com/thepatrick/video-uploader/blob/main/frontend/src/index.ts#L18).
2. When ready begin uploading, look at the array `fileInput.files`. The example only allows a [single file at once](https://github.com/thepatrick/video-uploader/blob/main/frontend/src/index.ts#L83), so we'll refer to it as `file`.
3. You can then find the size (`file.size`, in bytes), name (`file.name`). 

### (Backend) Create a Multipart Upload

This requires AWS credentials, so I did this using a lambda [beginUpload](https://github.com/thepatrick/video-uploader/blob/main/backend-lambda/src/handlers/beginUpload.ts) - most of that function just performs authentication/authorisation checks to prevent abuse, the key part is [client.createMultipartUpload](https://github.com/thepatrick/video-uploader/blob/main/backend-lambda/src/handlers/beginUpload.ts#L52) which could be as simple as

```typescript
  const { UploadId } = await client.createMultipartUpload({ Bucket: bucket, Key: objectName, }).promise();
```

You'll need to use this `UploadId` when creating signed URLs and when completeing the upload. The frontend doesn't need to know the value of `UploadId`, but you may find it easier to have the browser include this when asking for signed URLs & indicating the upload is finished. The example uses a signed JWT to prevent the end user modifying the UploadId.

### (Backend) Create a signed URL for each part

Example: [getUploadURL](https://github.com/thepatrick/video-uploader/blob/main/backend-lambda/src/handlers/getUploadURL.ts)

This creates URLs that the browser can upload each part to, and includes a signature so no further authentication is required. The `PartNumber` is 1-indexed (e.g. if you are going to upload the file in 3 parts, use `1`, `2`, `3`). The `Expires` is in seconds - if you call this method immediately before each part then it doesn't need to be too long.

```typescript
  const signedURL = await client.getSignedUrlPromise('uploadPart', {
    Bucket: bucket,
    Key: objectName,
    Expires: 30 * 60,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
```

### (Frontend) Upload each part

I upload files in 10,000,000 byte chunks (`const FILE_CHUNK_SIZE = 10_000_000;`).

1. Obtain a signed URL for this part
2. Get a blob for this part of the file:
    ```typescript
    const slice = file.slice(partNumber * FILE_CHUNK_SIZE, Math.min((partNumber + 1) * FILE_CHUNK_SIZE, file.size));
    ```
3. Use XHR/Fetch to `put` to the signed URL. I use [axios](https://github.com/axios/axios):
   ```typescript
   const output = await axios.put(uploadUrl, blob);
   ```
4. Keep track of the `etag` header, you'll need this to finish the upload:
   ```typescript
   const etag = (output.headers as { etag: string }).etag;`);
   ```

### (Backend) Complete upload

Example: [finishUpload](https://github.com/thepatrick/video-uploader/blob/main/backend-lambda/src/handlers/finishUpload.ts)

This tells S3 to assemble your multipart chunks into a single file. You'll need an array with the `etag` from each succesfully uploaded chunk:

```typescript
    await client
      .completeMultipartUpload({
        Bucket: bucket,
        Key: objectName,
        UploadId: uploadId,
        MultipartUpload: { Parts: [{ ETag: 'part1 etag', PartNumber: 1 }, ...] },
      })
      .promise();
```

### Handle failed uploads

Incomplete uploads use S3 storage, so you should clean up incomplete uploads. There's a couple of ways to do this:

1. Tell S3 when you know an upload has failed. The example has [abandonUpload](https://github.com/thepatrick/video-uploader/blob/main/backend-lambda/src/handlers/abandonUpload.ts) for this.

2. Use a S3 lifecycle rule. The example uses CloudFormation to set [AbortIncompleteMultipartUpload](https://github.com/thepatrick/video-uploader/blob/main/deployment.cfn.yaml#L34) to delete uploads that aren't completed within 2 days.

## Sources

* [Multipart uploads with S3 pre-signed URLs](https://www.altostra.com/blog/multipart-uploads-with-s3-presigned-url)
