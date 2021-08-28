rm -rf latest
gsutil -m rm -r gs://manage-hr.appspot.com/latest
gcloud firestore export gs://manage-hr.appspot.com/latest
gsutil -m cp -r gs://manage-hr.appspot.com/latest ./
