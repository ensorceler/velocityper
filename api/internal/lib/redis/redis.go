package redis_cli

import (
	"context"
	"fmt"
	"log"
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

func (rc REDISClient) CheckPing() *redis.StatusCmd {
	return rc.Client.Conn().Ping(ctx)
}

func (rc REDISClient) SetKeyVal(key string, val any) {
	err := rc.Client.Set(ctx, key, val, 0).Err()
	if err != nil {
		panic(err)
	}
}

func (rc REDISClient) DeleteKey(key string) {
	err := rc.Client.Del(ctx, key).Err()
	if err != nil {
		panic(err)
	}
}

func (rc REDISClient) GetKeyVal(key string) string {
	val, err := rc.Client.Get(ctx, key).Result()
	if err == redis.Nil {
		return ""
	}
	return val
}

func (rc REDISClient) GetBatchKeyVal(keys ...string) []interface{} {
	val, err := rc.Client.MGet(ctx, keys...).Result()
	if err == redis.Nil {
		return []interface{}{}
	}
	return val
}
func (rc REDISClient) PublishMessage(key string, val string) {
	err := rc.Client.Publish(ctx, key, val).Err()
	if err != nil {
		panic(err)
	}
}

func (rc REDISClient) PubSub(subscriptionChannel string) *redis.PubSub {
	// There is no error because go-redis automatically reconnects on error.
	return rc.Client.Subscribe(ctx, subscriptionChannel)
}

func (rc REDISClient) HSET(key string, val ...interface{}) {
	err := rc.Client.HSet(ctx, key, val).Err()
	if err != nil {
		panic(err)
	}
}

func (rc REDISClient) SADD(key string, val ...interface{}) {
	err := rc.Client.SAdd(ctx, key, val).Err()
	if err != nil {
		log.Println("sadd error: ", err)
		panic(err)
	}
}

func (rc REDISClient) SMembers(key string) []string {
	members, err := rc.Client.SMembers(ctx, key).Result()
	if err != nil {
		log.Println("sadd error: ", err)
		panic(err)
	}
	return members
}

func (rc REDISClient) SREM(key string, val ...interface{}) {
	err := rc.Client.SRem(ctx, key, val).Err()
	if err != nil {
		log.Println("srem error: ", err)
		panic(err)
	}
}
