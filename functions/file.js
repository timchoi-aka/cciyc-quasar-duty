/* eslint-disable max-len */

const {storage, FireAuth} = require("./fbadmin");
const {onRequest} = require("firebase-functions/v2/https");
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

exports.savefiletostorage = onRequest(
  {cors: [/cciyc\.com$/, /localhost$/], region: ["asia-east2"]}, 
  async (req, res) => {
    // Set CORS headers for the preflight request
    if (req.method == 'OPTIONS') {
      // Allows GET requests from any origin with the Content-Type
      // header and caches preflight response for an 3600s
      headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '3600'
      }

      return ('', 204, headers)
    }
    
    //console.log("header:" + JSON.stringify(req.headers))
    let token = req.headers.authorization.split('Bearer ')[1]
    console.log("token:" + JSON.stringify(token))
    FireAuth.getAuth().verifyIdToken(token).then((decodedtoken) => {
      console.log("decoded token:" + JSON.stringify(decodedToken))
    }).catch((error) => {
      console.log("token error:" + JSON.stringify(error))
    })
    
    
    res.setHeader('Access-Control-Allow-Origin', '*')
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        // Cloud functions impose this restriction anyway
        fileSize: 10 * 1024 * 1024,
      },
    });
  
    const fields = {};
    const files = [];
    const fileWrites = [];
    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    const tmpdir = os.tmpdir();
  
    busboy.on("field", (key, value) => {
      // You could do additional deserialization logic here, values will just be
      // strings
      fields[key] = value;
    });
  
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      filename.filename = Buffer.from(filename.filename, 'latin1').toString('utf8');
      filename.encoding = 'utf8';
      const filepath = path.join(tmpdir, filename.filename);
      /*
      console.log(
        `Handling file upload field ${fieldname}: ${filename.filename} (${filepath})`
      );
      */
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);
  
      fileWrites.push(
        new Promise((resolve, reject) => {
          file.on("end", () => writeStream.end());
          writeStream.on("finish", () => {
            fs.readFile(filepath, (err, buffer) => {
              const size = Buffer.byteLength(buffer);
              console.log(`${filename.filename} is ${size} bytes`);
              if (err) {
                return reject(err);
              }
  
              files.push({
                fieldname,
                originalname: filename.filename,
                encoding,
                mimetype,
                buffer,
                size,
              });
  
              try {
                fs.unlinkSync(filepath);
              } catch (error) {
                return reject(error);
              }
  
              resolve();
            });
          });
          writeStream.on("error", reject);
        })
      );
    });
  
    busboy.on("finish", () => {
      Promise.all(fileWrites)
        .then(() => {
          req.body = fields;
          req.files = files;
          // console.log("req.body: " + JSON.stringify(req.body));
          // console.log("req.files: " + JSON.stringify(req.files));
          try {
            const bucketName = "cciyc-web";
            // console.log("body:" + req.body)
            // const fileName = "test-file";
            // const fileName = req.headers;
            // console.log("req.headers: " + JSON.stringify(req.headers));
            // Upload the file to the bucket
            req.files.forEach((file) => {
              storage.bucket(bucketName).file(file.originalname).save(file.buffer);
            })
            
            res.status(200).send("Success");
          } catch (error) {
            console.error(error);
            res.status(500).send("Failed to upload file");
          }
        });
        //.catch(next);
    });
  
    busboy.end(req.rawBody);
});

function hash(str) {
  if (str == "") return 0;
  let hashString = 0;
  for (let character of str) {
     let charCode = character.charCodeAt(0);
     hashString = hashString << 5 - hashString;
     hashString += charCode;
     hashString |= hashString;
  }
  return hashString;
}