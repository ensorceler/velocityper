package redis_cli

import (
	"context"
	"errors"
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

	redisHost := "127.0.0.1"
	redisPort := "6379"
	redisPassword := ""

	//fmt.Println("config docker container", config.GetEnv("DOCKER_CONTAINER"))
	fmt.Println("ENV: Docker Container =>", config.GetEnv("DOCKER_CONTAINER"))

	redisOpt := redis.Options{
		Addr: fmt.Sprintf("%s:%s", redisHost, redisPort),
	}

	if config.GetEnv("DOCKER_CONTAINER") != nil {
		//fmt.Println("ENV: Docker Container =>", config.GetEnv("DOCKER_CONTAINER"))
		redisHost = config.GetEnv("REDIS_HOST").(string)
		redisPort = config.GetEnv("REDIS_PORT").(string)
		redisPassword = config.GetEnv("REDIS_PASSWORD").(string)
		// if inside docker,set redis-password
		redisOpt.Addr = fmt.Sprintf("%s:%s", redisHost, redisPort)
		redisOpt.Password = redisPassword
	}
	fmt.Printf("REDIS:options => %+v\n", redisOpt)
	redisClient.Client = redis.NewClient(&redisOpt)

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
func (rc REDISClient) PublishMessage(key string, val any) {
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

func (rc REDISClient) SIsMember(key string, member interface{}) bool {
	isMember, err := rc.Client.SIsMember(ctx, key, member).Result()
	if err != nil {
		log.Println("sadd error: ", err)
		panic(err)
	}
	return isMember
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

func (rc REDISClient) ZADD(key string, score float64, member string) {
	_, err := rc.Client.ZAdd(ctx, key, redis.Z{Score: score, Member: member}).Result()
	if err != nil {
		log.Println("zadd error: ", err)
		panic(err)
	}
}

func (rc REDISClient) ZRank(key string, member string) int64 {
	//err := rc.Client.ZAdd(ctx, key, redis.Z{score, member})
	rank, err := rc.Client.ZRank(ctx, key, member).Result()
	if err != nil {
		log.Println("zrank error: ", err)
		if errors.Is(err, redis.Nil) {
			return -1
		} else {
			panic(err)
		}
	}
	return rank
}

func (rc REDISClient) FlushAll() {
	flush, err := rc.Client.FlushAll(ctx).Result()
	if err != nil {
		log.Println("flushall error: ", err)
	}
	fmt.Println("REDIS FLUSH: ", flush)
}
