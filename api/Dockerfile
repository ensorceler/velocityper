FROM golang:latest

ENV TZ="Asia/Kolkata"
ENV DOCKER_CONTAINER=true
ENV GOPROXY=direct

WORKDIR /app/velocityper

COPY . .

RUN apt update && apt install -y git

RUN go mod download

EXPOSE 6543 

CMD [ "go","run","cmd/server/main.go" ]
