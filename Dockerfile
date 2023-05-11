FROM golang:1.20

WORKDIR /app

COPY . .

RUN make all

CMD ["./cmd/main"]