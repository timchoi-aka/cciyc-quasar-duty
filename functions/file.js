const { storage, functions } = require('./fbadmin');
const cors = require('cors')({
  origin: ['http://localhost:8888', 'https://duty.cciyc.com', 'http://localhost:9000'],
});
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');

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
          message: 'Successfully uploaded ' + req.headers.path + '/' + req.headers.filename + ' to ' + defaultBucket + ' in storage'
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
