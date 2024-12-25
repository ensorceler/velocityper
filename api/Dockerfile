FROM golang:1.23-alpine

ENV DOCKER_CONTAINER true

WORKDIR /app/velocityper

COPY . .

RUN go mod download

EXPOSE 6543 

CMD [ "go","run","cmd/server/main.go" ]