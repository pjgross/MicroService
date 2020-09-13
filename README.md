docker build --no-cache -t registry.gitlab.com/microservice_example/ticketing/tickets:dev --target dev .
docker push registry.gitlab.com/microservice_example/ticketing/tickets:dev
docker build --no-cache -t registry.gitlab.com/microservice_example/ticketing/tickets:prod --target prod .
docker push registry.gitlab.com/microservice_example/ticketing/tickets:prod
