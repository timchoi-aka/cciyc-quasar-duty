rm -rf latest
gsutil -o "GSUtil:parallel_process_count=1" -m rm -r gs://manage-hr.appspot.com/latest 
gcloud firestore export gs://manage-hr.appspot.com/latest 
gsutil -o "GSUtil:parallel_process_count=1" -m cp -r gs://manage-hr.appspot.com/latest ./ 
