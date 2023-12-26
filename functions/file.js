const { storage, functions } = require('./fbadmin');
const cors = require('cors')({
  origin: ['http://localhost:8888', 'https://duty.cciyc.com', 'http://localhost:9000'],
});
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

exports.rotateImage = functions.region("asia-east2").https.onRequest(async (req, res) => {
  cors(req, res, () => {
    try {
      const bucketName = req.body.bucket;
      const fileName = req.body.filename;
      const path = req.body.path;
      const rotation = req.body.rotation || 90; // Default rotation is 90 degrees

      const bucket = storage.bucket(bucketName);
      const file = bucket.file(path + "/" + fileName);
      const tempLocalFilename = `/tmp/${fileName}`;


      // Check if the file exists
      if (fs.existsSync(tempLocalFilename)) {
        // If the file exists, delete it
        fs.unlinkSync(tempLocalFilename);
      }

      // Check if the file exists
      if (fs.existsSync(`${tempLocalFilename}-rotated`)) {
        // If the file exists, delete it
        fs.unlinkSync(`${tempLocalFilename}-rotated`);
      }

      // Download file from bucket.
      file.download({ destination: tempLocalFilename }).then(() => {
        // Rotate the image using Sharp
        sharp(tempLocalFilename)
        .rotate(rotation)
        .toFile(`${tempLocalFilename}-rotated`).then(() => {
          // Upload the rotated image back to the bucket
          bucket.upload(`${tempLocalFilename}-rotated`, {
            destination: `${path}/${fileName}`,
            metadata: {
              cacheControl: 'no-store, max-age=0',
            },
          }).then(() => {
            res.status(200).send({message: `/${bucketName}/${path}/${fileName} rotated by ${rotation} degrees`, status: 'success'});
          })
        })
      })
    } catch (error) {
      res.status(500).send({ message: `An error occurred: ${error.message}`, status: 'error' });
    }
  });
});

exports.savefiletostorage = functions.region("asia-east2").https.onRequest(async (req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(500).json({
        message: 'Cannot use ' + req.method + ' method'
      });
    }
    const defaultBucket = "cciyc-web"
    const saveTo = req.headers.path.length > 0? req.headers.path + "/" : '';
    const busboy = Busboy({headers: req.headers});
    let uploadData = null;

    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      fname = Buffer.from(filename.filename, 'latin1').toString('utf8');
      encoding = 'utf8';
      mimetype = filename.mimeType
      const filepath = path.join(os.tmpdir(), fname);
      uploadData = {file: filepath, type: mimetype};
      file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
      const bucket = storage.bucket(defaultBucket);

      bucket.upload(uploadData.file, {
        destination: saveTo + fname,
        uploadType: 'media',
        metadata: {
          metadata: {
            contentType: uploadData.type
          }
        }
      })
      .then(() => {
        res.status(200).json({
          message: 'Successfully uploaded ' + req.headers.path + '/' + fname + ' to ' + defaultBucket + ' in storage'
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
    });
    busboy.end(req.rawBody);
  });
});

exports.deleteFileFromStorage = functions.region('asia-east2').https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(500).json({
        message: 'Cannot use ' + req.method + ' method'
      });
    }

    const defaultBucket = 'cciyc-web';
    const filePath = req.headers.path;

    if (!filePath) {
      return res.status(400).json({
        message: 'No file path provided'
      });
    }

    try {
      await storage.bucket(defaultBucket).file(filePath).delete();
      res.status(200).send({ message: 'File deleted successfully.' });
    } catch (error) {
      res.status(500).send({ error: 'Failed to delete the file.' });
    }
  });
});

exports.deleteFolderFromStorage = functions.region('asia-east2').https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(500).json({
        message: 'Cannot use ' + req.method + ' method'
      });
    }

    const defaultBucket = 'cciyc-web';
    const folderPath = req.headers.path;

    if (!folderPath) {
      return res.status(400).json({
        message: 'No folder path provided'
      });
    }

    try {
      const [files] = await storage.bucket(defaultBucket).getFiles({ prefix: folderPath });
      files.forEach(file => file.delete());
      res.status(200).send({ message: 'Folder deleted successfully.' });
    } catch (error) {
      res.status(500).send({ error: 'Failed to delete the folder.' });
    }
  });
});

exports.getFiles = functions.region('asia-east2').https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(500).json({
        message: 'Cannot use ' + req.method + ' method'
      });
    }

    const defaultBucket = 'cciyc-web';
    const folderPath = req.headers.path;

    if (!folderPath) {
      return res.status(400).json({
        message: 'No folder path provided'
      });
    }

    try {
      const [files] = await storage.bucket(defaultBucket).getFiles({ prefix: folderPath });
      const fileNames = files.map(file => file.name);
      res.status(200).send({ fileNames });
    } catch (error) {
      res.status(500).send({ error: 'Failed to get the files.' });
    }
  });
});
