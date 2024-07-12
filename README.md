Docker Building:

docker build -t api:latest .
docker run -it -e GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-file.json  -p 100:100 api:latest

#bucekt name- docker54321 us-west1
Invoking:

curl -H 'Content-Type: application/json' \
    -d '{ "name": "TestUsr", "age": 10, "email": "test@example.com" }' \
    -X POST \
    http://localhost:100

curl  -X GET \
  'http://localhost:100' \
  --header 'Accept: */*' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "id": "UzPg0cwsOHIF6skh9aJG" }'
