package redis_cli

import (
	"context"
	"fmt"
	"velocityper/api/internal/config"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

type REDISClient struct {
	Client *redis.Client
}

var redisClient REDISClient

func CreateNewClient() {
	//fmt.Println()

	redisHost := "127.0.0.1"
	redisPort := "6379"

	//fmt.Println("config docker container", config.GetEnv("DOCKER_CONTAINER"))

	if config.GetEnv("DOCKER_CONTAINER") != nil {
		redisHost = config.GetEnv("REDIS_HOST").(string)
		redisPort = config.GetEnv("REDIS_PORT").(string)
	}

	redisClient.Client = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", redisHost, redisPort),
		//config.GetEnv("REDIS"),
	})

}

func GetRedisClient() *REDISClient {
	return &redisClient
}

func (r REDISClient) CheckPing() *redis.StatusCmd {
	return r.Client.Conn().Ping(ctx)
}

func (r REDISClient) SetKeyVal(key string, val any) {
	err := r.Client.Set(ctx, key, val, 0).Err()
	if err != nil {
		panic(err)
	}
}

func (r REDISClient) GetKeyVal(key string) string {
	val, err := r.Client.Get(ctx, key).Result()
	if err == redis.Nil {
		return ""
	}
	return val
}

func (r REDISClient) PublishMessage(key string, val string) {
	err := r.Client.Publish(ctx, key, val).Err()
	if err != nil {
		panic(err)
	}
}

func (r REDISClient) PubSub(subscriptionChannel string) *redis.PubSub {
	// There is no error because go-redis automatically reconnects on error.
	return r.Client.Subscribe(ctx, subscriptionChannel)
}
